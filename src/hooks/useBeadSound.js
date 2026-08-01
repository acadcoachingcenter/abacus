import { useCallback, useRef } from 'react';

/**
 * Lightweight synthesized bead-click sound so Phase 1 doesn't depend on
 * shipping audio assets. A real "click" sample can be dropped into
 * public/sounds/bead-click.mp3 later and swapped in without changing
 * the calling components.
 */
export function useBeadSound(enabled) {
  const ctxRef = useRef(null);

  const play = useCallback(
    (pitch = 1) => {
      if (!enabled) return;
      try {
        if (!ctxRef.current) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          ctxRef.current = new AudioCtx();
        }
        const ctx = ctxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 520 * pitch;
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch {
        // Silently ignore audio failures (e.g. autoplay policy) — sound is optional.
      }
    },
    [enabled]
  );

  return play;
}
