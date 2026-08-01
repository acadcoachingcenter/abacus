import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import SorobanAbacus from './SorobanAbacus';

/**
 * A small "try it" panel pairing the abacus with a target-number prompt.
 * This is a lightweight preview of the guided demonstration mechanic
 * (spec section 3) — full step-by-step hand/mouse-pointer choreography
 * belongs to the Phase 3 lesson engine and will reuse this same
 * highlightRod + imperative-ref pattern.
 */
export default function AbacusDemoPanel({ rodCount = 5 }) {
  const abacusRef = useRef(null);
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState(null); // 'correct' | 'retry' | null

  const maxValue = Math.pow(10, rodCount) - 1;

  const checkAnswer = () => {
    if (target === '') return;
    const current = abacusRef.current?.getValue();
    if (current === Number(target)) {
      setStatus('correct');
    } else {
      setStatus('retry');
    }
  };

  const showAnswer = () => {
    if (target === '') return;
    abacusRef.current?.setValue(Number(target));
    setStatus(null);
  };

  return (
    <div className="bg-white/70 backdrop-blur rounded-3xl border border-sandalwood/30 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-5">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-rosewood/70 mb-1 font-display">
            Try it — show this number on the abacus
          </label>
          <input
            type="number"
            min="0"
            max={maxValue}
            value={target}
            onChange={(e) => {
              setTarget(e.target.value);
              setStatus(null);
            }}
            placeholder={`e.g. ${Math.floor(maxValue / 3)}`}
            className="w-full rounded-xl border border-sandalwood/50 px-4 py-2.5 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-saffron"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={checkAnswer}
            className="px-4 py-2.5 rounded-xl bg-teal text-white font-semibold font-display hover:bg-teal-dark transition-colors"
          >
            Check
          </button>
          <button
            type="button"
            onClick={showAnswer}
            className="px-4 py-2.5 rounded-xl bg-ivory-dim text-rosewood font-semibold font-display border border-sandalwood/50 hover:bg-sandalwood/20 transition-colors"
          >
            Show Hint
          </button>
        </div>
      </div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 px-4 py-2 rounded-xl text-sm font-semibold font-body ${
            status === 'correct' ? 'bg-teal/10 text-teal-dark' : 'bg-saffron/15 text-saffron-dark'
          }`}
        >
          {status === 'correct' ? '✓ Excellent! That\u2019s correct.' : 'Not quite — try moving the beads again, or tap "Show Hint".'}
        </motion.div>
      )}

      <SorobanAbacus ref={abacusRef} rodCount={rodCount} size="md" label="Practice abacus" />
    </div>
  );
}
