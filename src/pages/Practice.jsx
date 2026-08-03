import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SorobanAbacus from '../components/abacus/SorobanAbacus';
import { generateExercise, CATEGORIES, DIFFICULTIES } from '../utils/practiceGenerator';

const CATEGORY_LABELS = {
  representation: 'Number Representation',
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  mixed: 'Mixed Arithmetic',
  complement: 'Complement Exercises',
  speed: 'Speed Exercises',
};

const ROD_COUNT_BY_DIFFICULTY = { easy: 3, medium: 4, hard: 6, expert: 8 };

export default function Practice() {
  const [category, setCategory] = useState('addition');
  const [difficulty, setDifficulty] = useState('easy');
  const [exercise, setExercise] = useState(() => generateExercise('addition', 'easy'));
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ correct: 0, attempted: 0 });
  const abacusRef = useRef(null);

  const nextExercise = (cat = category, diff = difficulty) => {
    setExercise(generateExercise(cat, diff));
    setFeedback(null);
    abacusRef.current?.reset();
  };

  const check = () => {
    const given = abacusRef.current?.getValue();
    const correct = given === exercise.answer;
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), attempted: s.attempted + 1 }));
    setFeedback(correct ? 'correct' : 'retry');
    if (correct) setTimeout(() => nextExercise(), 800);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/" className="text-sm text-rosewood/50 hover:text-rosewood font-body">← Home</Link>
        <h1 className="font-display text-3xl font-bold text-rosewood mt-2 mb-1">Practice</h1>
        <p className="text-rosewood/60 font-body mb-6">Unlimited generated exercises, any category, any difficulty.</p>

        <div className="flex flex-wrap gap-3 mb-6">
          <Select
            label="Category"
            value={category}
            options={CATEGORIES.map((c) => [c, CATEGORY_LABELS[c]])}
            onChange={(v) => {
              setCategory(v);
              nextExercise(v, difficulty);
            }}
          />
          <Select
            label="Difficulty"
            value={difficulty}
            options={DIFFICULTIES.map((d) => [d, d[0].toUpperCase() + d.slice(1)])}
            onChange={(v) => {
              setDifficulty(v);
              nextExercise(category, v);
            }}
          />
        </div>

        <div className="bg-white/70 backdrop-blur rounded-3xl border border-sandalwood/30 p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-body text-rosewood/50">
              Score: {stats.correct}/{stats.attempted}
            </span>
            <button
              type="button"
              onClick={() => nextExercise()}
              className="text-xs font-bold text-teal font-display underline underline-offset-2"
            >
              Skip →
            </button>
          </div>

          <motion.p
            key={exercise.prompt}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-mono font-bold text-rosewood mb-5"
          >
            {exercise.prompt}
          </motion.p>

          <SorobanAbacus
            ref={abacusRef}
            rodCount={ROD_COUNT_BY_DIFFICULTY[difficulty]}
            label="Your abacus"
          />

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 px-4 py-2 rounded-xl text-sm font-semibold font-body inline-block ${
                feedback === 'correct' ? 'bg-teal/10 text-teal-dark' : 'bg-saffron/15 text-saffron-dark'
              }`}
            >
              {feedback === 'correct' ? '✓ Correct!' : '✗ Not quite — adjust the beads and try again'}
            </motion.div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={check}
              className="px-5 py-2.5 rounded-xl bg-teal text-white font-bold font-display hover:bg-teal-dark transition-colors"
            >
              Check answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="text-sm font-body">
      <span className="block text-rosewood/60 font-semibold mb-1 font-display text-xs uppercase tracking-wide">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-sandalwood/50 px-3 py-2 bg-white font-body focus:outline-none focus:ring-2 focus:ring-saffron"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}
