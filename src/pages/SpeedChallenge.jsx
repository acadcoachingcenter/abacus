import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SorobanAbacus from '../components/abacus/SorobanAbacus';
import { generateExercise } from '../utils/practiceGenerator';

const DURATION_S = 60;

export default function SpeedChallenge() {
  const [phase, setPhase] = useState('setup'); // setup | playing | finished
  const [category, setCategory] = useState('addition');
  const [difficulty, setDifficulty] = useState('easy');
  const [timeLeft, setTimeLeft] = useState(DURATION_S);
  const [exercise, setExercise] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionTimes, setQuestionTimes] = useState([]);
  const abacusRef = useRef(null);
  const questionStartRef = useRef(null);
  const intervalRef = useRef(null);

  const start = () => {
    setCorrect(0);
    setIncorrect(0);
    setStreak(0);
    setBestStreak(0);
    setQuestionTimes([]);
    setTimeLeft(DURATION_S);
    nextExercise();
    setPhase('playing');
  };

  const nextExercise = () => {
    setExercise(generateExercise(category, difficulty));
    questionStartRef.current = Date.now();
    abacusRef.current?.reset();
  };

  useEffect(() => {
    if (phase !== 'playing') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setPhase('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const submit = () => {
    if (!exercise) return;
    const given = abacusRef.current?.getValue();
    const isCorrect = given === exercise.answer;
    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    setQuestionTimes((qt) => [...qt, elapsed]);

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setIncorrect((c) => c + 1);
      setStreak(0);
    }
    nextExercise();
  };

  const attempted = correct + incorrect;
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const avgTime = questionTimes.length
    ? (questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/" className="text-sm text-rosewood/50 hover:text-rosewood font-body">← Home</Link>
        <h1 className="font-display text-3xl font-bold text-rosewood mt-2 mb-1">Speed Challenge</h1>
        <p className="text-rosewood/60 font-body mb-6">{DURATION_S} seconds. Solve as many as you can.</p>

        <div className="bg-white/70 backdrop-blur rounded-3xl border border-sandalwood/30 p-5 sm:p-7 shadow-sm">
          {phase === 'setup' && (
            <div className="space-y-4">
              <Select label="Category" value={category} onChange={setCategory}
                options={[['addition', 'Addition'], ['subtraction', 'Subtraction'], ['multiplication', 'Multiplication'], ['division', 'Division'], ['mixed', 'Mixed']]} />
              <Select label="Difficulty" value={difficulty} onChange={setDifficulty}
                options={[['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard'], ['expert', 'Expert']]} />
              <button
                type="button"
                onClick={start}
                className="w-full px-5 py-3 rounded-xl bg-saffron text-rosewood-dark font-bold font-display hover:bg-saffron-dark transition-colors"
              >
                Start 60-second challenge
              </button>
            </div>
          )}

          {phase === 'playing' && exercise && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-bold text-teal-dark">{timeLeft}s</span>
                <span className="text-sm font-body text-rosewood/60">
                  ✓ {correct} · ✗ {incorrect} · streak {streak}
                </span>
              </div>
              <motion.p
                key={exercise.prompt}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-mono font-bold text-rosewood mb-5"
              >
                {exercise.prompt}
              </motion.p>
              <SorobanAbacus ref={abacusRef} rodCount={5} label="Your abacus" allowHideValue={false} />
              <button
                type="button"
                onClick={submit}
                className="mt-4 px-5 py-2.5 rounded-xl bg-teal text-white font-bold font-display hover:bg-teal-dark transition-colors"
              >
                Submit
              </button>
            </div>
          )}

          {phase === 'finished' && (
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-rosewood mb-4">Time's up!</h2>
              <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                <Stat label="Score" value={correct} />
                <Stat label="Accuracy" value={`${accuracy}%`} />
                <Stat label="Best Streak" value={bestStreak} />
                <Stat label="Avg. time / question" value={`${avgTime}s`} />
              </div>
              <button
                type="button"
                onClick={() => setPhase('setup')}
                className="px-5 py-2.5 rounded-xl bg-saffron text-rosewood-dark font-bold font-display hover:bg-saffron-dark transition-colors"
              >
                Play again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block text-sm font-body">
      <span className="block text-rosewood/60 font-semibold mb-1 font-display text-xs uppercase tracking-wide">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-sandalwood/50 px-3 py-2 bg-white font-body focus:outline-none focus:ring-2 focus:ring-saffron"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-ivory-dim rounded-xl px-4 py-3 border border-sandalwood/20">
      <div className="text-xs text-rosewood/50 font-body uppercase tracking-wide">{label}</div>
      <div className="text-xl font-mono font-bold text-rosewood">{value}</div>
    </div>
  );
}
