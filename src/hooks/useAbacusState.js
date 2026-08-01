import { useCallback, useMemo, useState } from 'react';
import { emptyRods, computeValue, clampRodCount } from '../utils/abacusEngine';

export function useAbacusState(initialRodCount = 9) {
  const rodCount = clampRodCount(initialRodCount);
  const [rods, setRods] = useState(() => emptyRods(rodCount));
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const value = useMemo(() => computeValue(rods), [rods]);

  // Commit a new rod state, recording history. Used for discrete actions
  // (a completed click, or the end of a drag) — not on every drag-move
  // frame, so undo steps feel like one "bead push" rather than a scrub.
  const commit = useCallback((updater) => {
    setRods((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setPast((p) => [...p, prev]);
      setFuture([]);
      return next;
    });
  }, []);

  // Live-preview during a drag, without pushing history yet.
  const preview = useCallback((updater) => {
    setRods((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prevState = p[p.length - 1];
      setRods((current) => {
        setFuture((f) => [current, ...f]);
        return prevState;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const nextState = f[0];
      setRods((current) => {
        setPast((p) => [...p, current]);
        return nextState;
      });
      return f.slice(1);
    });
  }, []);

  const reset = useCallback(() => {
    commit(() => emptyRods(rodCount));
  }, [commit, rodCount]);

  const clear = reset;

  const setAll = useCallback(
    (newRods) => {
      commit(() => newRods);
    },
    [commit]
  );

  return {
    rods,
    value,
    rodCount,
    commit,
    preview,
    undo,
    redo,
    reset,
    clear,
    setAll,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
