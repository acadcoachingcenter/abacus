import { useCallback, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EARTH_BEADS_PER_ROD, nextEarthCount, valueToRods } from '../../utils/abacusEngine';
import { useAbacusState } from '../../hooks/useAbacusState';
import { useBeadSound } from '../../hooks/useBeadSound';

/**
 * SorobanAbacus
 *
 * A realistic, responsive Soroban with one heaven bead (value 5) and four
 * earth beads (value 1 each) per rod. Works identically with mouse click,
 * mouse drag, finger tap, and finger drag via the Pointer Events API.
 *
 * Exposes an imperative handle so parent lesson/practice components can
 * read the value, force a specific number, and drive the guided demo.
 */
const SorobanAbacus = forwardRef(function SorobanAbacus(
  {
    rodCount = 9,
    soundEnabled = true,
    showValue: showValueProp = true,
    allowHideValue = true,
    highlightRod = null,
    label = 'Interactive abacus',
    size = 'md', // 'sm' | 'md' | 'lg'
    onChange = () => {},
  },
  ref
) {
  const abacus = useAbacusState(rodCount);
  const { rods, value, preview, commit, undo, redo, reset, canUndo, canRedo } = abacus;
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const playSound = useBeadSound(soundOn);

  const [valueVisible, setValueVisible] = useState(showValueProp);
  const dragState = useRef(null); // { rod, zone, initialCount }
  const frameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getValue: () => value,
    setValue: (n) => abacus.setAll(valueToRods(n, abacus.rodCount)),
    reset: () => abacus.reset(),
    getRods: () => rods,
  }));

  const notify = useCallback(
    (next) => {
      onChange(next);
    },
    [onChange]
  );

  // ---- Pointer interaction -------------------------------------------------

  const handleHeavenPointer = (rodIndex, e, isFinal) => {
    const zoneEl = e.currentTarget;
    const rect = zoneEl.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const active = y > rect.height * 0.45 ? 1 : 0;

    const updater = (prev) => {
      if (prev[rodIndex].heaven === active) return prev;
      const next = prev.map((r, i) => (i === rodIndex ? { ...r, heaven: active } : r));
      return next;
    };

    if (isFinal) {
      commit((prev) => {
        const next = updater(prev);
        if (next !== prev) {
          playSound(1.3);
          notify(next);
        }
        return next;
      });
    } else {
      preview(updater);
    }
  };

  const handleEarthPointer = (rodIndex, e, isFinal) => {
    const zoneEl = e.currentTarget;
    const rect = zoneEl.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotHeight = rect.height / EARTH_BEADS_PER_ROD;
    const slotIndex = Math.floor(y / slotHeight);

    if (!dragState.current || dragState.current.rod !== rodIndex) {
      dragState.current = { rod: rodIndex, initialCount: rods[rodIndex].earth };
    }
    const baseCount = dragState.current.initialCount;
    const newCount = nextEarthCount(baseCount, slotIndex);

    const updater = (prev) => {
      if (prev[rodIndex].earth === newCount) return prev;
      return prev.map((r, i) => (i === rodIndex ? { ...r, earth: newCount } : r));
    };

    if (isFinal) {
      commit((prev) => {
        const next = updater(prev);
        if (next !== prev) {
          playSound(1);
          notify(next);
        }
        return next;
      });
      dragState.current = null;
    } else {
      preview(updater);
    }
  };

  const pointerHandlers = (zone, rodIndex) => ({
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      zone === 'heaven' ? handleHeavenPointer(rodIndex, e, false) : handleEarthPointer(rodIndex, e, false);
    },
    onPointerMove: (e) => {
      if (e.buttons === 0 && e.pointerType === 'mouse') return;
      zone === 'heaven' ? handleHeavenPointer(rodIndex, e, false) : handleEarthPointer(rodIndex, e, false);
    },
    onPointerUp: (e) => {
      zone === 'heaven' ? handleHeavenPointer(rodIndex, e, true) : handleEarthPointer(rodIndex, e, true);
    },
    onPointerCancel: () => {
      dragState.current = null;
    },
  });

  // ---- Sizing ---------------------------------------------------------------
  const sizeVar = { sm: '1.6rem', md: '2.1rem', lg: '2.6rem' }[size];

  return (
    <div
      className="w-full select-none"
      style={{ ['--bead']: `clamp(1.15rem, ${(92 / rodCount).toFixed(1)}vw, ${sizeVar})` }}
    >
      {(valueVisible || allowHideValue) && (
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-rosewood/60 font-display">
            {label}
          </span>
          <AnimatePresence mode="wait">
            {valueVisible ? (
              <motion.span
                key="visible"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="font-mono text-xl sm:text-2xl font-bold text-teal tabular-nums"
                aria-live="polite"
              >
                {value.toLocaleString('en-IN')}
              </motion.span>
            ) : (
              <motion.span
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-xl sm:text-2xl font-bold text-rosewood/30 tracking-widest"
              >
                • • • •
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      <div
        ref={frameRef}
        className="abacus-no-scroll relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-rosewood to-rosewood-dark shadow-frame p-2.5 sm:p-4 border border-rosewood-dark/60"
        role="group"
        aria-label={`${label}, current value ${value}`}
      >
        {/* wood grain texture */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #000 0px, transparent 1px, transparent 3px)',
          }}
        />

        <div className="relative bg-gradient-to-b from-sandalwood-light/95 to-sandalwood/90 rounded-xl sm:rounded-2xl p-1.5 sm:p-3 shadow-inner">
          <div className="flex justify-center gap-[2%]">
            {rods.map((rod, i) => {
              const isHighlighted = highlightRod === i;
              return (
                <div
                  key={i}
                  className="relative flex flex-col items-center flex-1 min-w-0"
                  style={{ maxWidth: 'calc(var(--bead) * 1.9)' }}
                >
                  {/* rod pin (behind beads) */}
                  <div
                    className="absolute top-0 bottom-0 w-[3px] bg-rosewood-dark/70 rounded-full"
                    style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }}
                  />

                  {/* HEAVEN ZONE */}
                  <div
                    {...pointerHandlers('heaven', i)}
                    className={`relative w-full touch-none cursor-pointer ${isHighlighted ? 'rounded-lg ring-2 ring-saffron/70' : ''}`}
                    style={{ height: 'calc(var(--bead) * 1.9)' }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Rod ${rodCount - i} heaven bead, ${rod.heaven ? 'active' : 'inactive'}`}
                    aria-pressed={!!rod.heaven}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        commit((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, heaven: r.heaven ? 0 : 1 } : r))
                        );
                        playSound(1.3);
                      }
                    }}
                  >
                    <Bead
                      top={rod.heaven ? 'calc(var(--bead) * 0.9)' : '0px'}
                      highlighted={isHighlighted && !rod.heaven}
                    />
                  </div>

                  {/* RECKONING BAR */}
                  <div className="relative w-full h-[5px] sm:h-[6px] bg-gradient-to-r from-teal-dark via-saffron to-teal-dark rounded-full my-0.5 shadow-sm z-10">
                    {(rodCount - i) % 3 === 0 && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ivory/80" />
                    )}
                  </div>

                  {/* EARTH ZONE */}
                  <div
                    {...pointerHandlers('earth', i)}
                    className={`relative w-full touch-none cursor-pointer ${isHighlighted ? 'rounded-lg ring-2 ring-saffron/70' : ''}`}
                    style={{ height: 'calc(var(--bead) * 4.2)' }}
                    tabIndex={0}
                    role="group"
                    aria-label={`Rod ${rodCount - i} earth beads, value ${rod.earth}`}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        commit((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, earth: Math.min(4, r.earth + 1) } : r))
                        );
                        playSound(1);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        commit((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, earth: Math.max(0, r.earth - 1) } : r))
                        );
                        playSound(0.85);
                      }
                    }}
                  >
                    {Array.from({ length: EARTH_BEADS_PER_ROD }).map((_, slot) => {
                      const active = slot < rod.earth;
                      // Active beads stack contiguously touching the bar (top of zone).
                      // Inactive beads stack contiguously resting at the bottom of the zone.
                      const top = active
                        ? `calc(var(--bead) * ${slot})`
                        : `calc(var(--bead) * ${4 - rod.earth + (slot - rod.earth)})`;
                      return (
                        <Bead
                          key={slot}
                          top={top}
                          highlighted={isHighlighted && slot === rod.earth}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-[11px] text-rosewood/40 font-body">
          Tap or drag beads toward the bar
        </span>
        {allowHideValue && (
          <button
            type="button"
            onClick={() => setValueVisible((v) => !v)}
            className="text-xs font-semibold text-teal hover:text-teal-dark underline underline-offset-2 font-body"
          >
            {valueVisible ? 'Hide value' : 'Show value'}
          </button>
        )}
      </div>

      <AbacusToolbar
        onReset={reset}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((s) => !s)}
      />
    </div>
  );
});

function Bead({ top, highlighted }) {
  return (
    <motion.div
      className={`absolute left-1/2 rounded-[35%] bg-gradient-to-br from-teal-light via-teal to-teal-dark shadow-bead ${
        highlighted ? 'ring-2 ring-saffron animate-pulseGlow' : ''
      }`}
      style={{
        width: 'calc(var(--bead) * 0.92)',
        height: 'calc(var(--bead) * 0.72)',
        marginLeft: 'calc(var(--bead) * -0.46)',
      }}
      animate={{ top }}
      transition={{ type: 'spring', stiffness: 480, damping: 32, mass: 0.6 }}
    />
  );
}

function AbacusToolbar({ onReset, onUndo, onRedo, canUndo, canRedo, soundOn, onToggleSound }) {
  const btn =
    'px-3 py-2 rounded-xl text-sm font-semibold font-display transition-colors disabled:opacity-35 disabled:cursor-not-allowed';
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`${btn} bg-ivory text-rosewood border border-sandalwood/50 hover:bg-sandalwood/20`}
      >
        ↶ Undo
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`${btn} bg-ivory text-rosewood border border-sandalwood/50 hover:bg-sandalwood/20`}
      >
        ↷ Redo
      </button>
      <button
        type="button"
        onClick={onReset}
        className={`${btn} bg-saffron text-rosewood-dark hover:bg-saffron-dark`}
      >
        ⟲ Reset
      </button>
      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        className={`${btn} ml-auto bg-ivory text-rosewood border border-sandalwood/50 hover:bg-sandalwood/20`}
      >
        {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
      </button>
    </div>
  );
}

export default SorobanAbacus;
