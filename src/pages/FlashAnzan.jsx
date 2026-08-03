import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genTerm(digits) {
  const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return randInt(min, max);
}

function generateSequence({ digits, termCount, mode }) {
  const terms = [];
  let running = genTerm(digits);
  terms.push({ value: running, sign: '+' });
  for (let i = 1; i < termCount; i++) {
    let sign = '+';
    if (mode === 'subtraction') sign = '-';
    else if (mode === 'mixed') sign = Math.random() < 0.5 ? '+' : '-';

    let value = genTerm(digits);
    if (sign === '-') {
      value = Math.min(value, running); // keep the running total non-negative
      if (value === 0) { sign = '+'; value = genTerm(digits); }
    }
    running = sign === '+' ? running + value : running - value;
    terms.push({ value, sign });
  }
  return { terms, answer: running };
}

const SPEED_PRESETS = [
  { label: '2.0s', ms: 2000 },
  { label: '1.0s', ms: 1000 },
  { label: '0.7s', ms: 700 },
  { label: '0.5s', ms: 500 },
  { label: '0.3s', ms: 300 },
];

export default function FlashAnzan() {
  const [settings, setSettings] = useState({
    digits: 1,
    termCount: 5,
    questionCount: 5,
    speedMs: 1000,
    mode: 'addition',
  });
  const [phase, setPhase] = useState('settings'); // settings | flashing | answer | roundResult | summary
  const [sequence, setSequence] = useState(null);
  const [flashIndex, setFlashIndex] = useState(-1);
  const [given, setGiven] = useState('');
  const [results, setResults] = useState([]); // { correct: bool, answer, given }
  const [questionNum, setQuestionNum] = useState(0);
  const timerRef = useRef(null);

  const startRound = () => {
    const seq = generateSequence(settings);
    setSequence(seq);
    setFlashIndex(-1);
    setGiven('');
    setPhase('flashing');
  };

  const start = () => {
    setResults([]);
    setQuestionNum(1);
    startRound();
  };

  useEffect(() => {
    if (phase !== 'flashing' || !sequence) return;
    let i = -1;
    const tick = () => {
      i += 1;
      if (i >= sequence.terms.length) {
        setPhase('answer');
        return;
      }
      setFlashIndex(i);
      timerRef.current = setTimeout(tick, settings.speedMs);
    };
    tick();
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sequence]);

  const submitAnswer = () => {
    const correct = Number(given) === sequence.answer;
    setResults((r) => [...r, { correct, answer: sequence.answer, given: Number(given) }]);
    setPhase('roundResult');
  };

  const nextQuestion = () => {
    if (questionNum >= settings.questionCount) {
      setPhase('summary');
    } else {
      setQuestionNum((n) => n + 1);
      startRound();
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/" className="text-sm text-rosewood/50 hover:text-rosewood font-body">← Home</Link>
        <h1 className="font-display text-3xl font-bold text-rosewood mt-2 mb-1">Flash Anzan</h1>
        <p className="text-rosewood/60 font-body mb-6">Mental arithmetic — no abacus, just visualization.</p>

        <div className="bg-white/70 backdrop-blur rounded-3xl border border-sandalwood/30 p-5 sm:p-7 shadow-sm min-h-[320px] flex flex-col justify-center">
          {phase === 'settings' && (
            <div className="space-y-5">
              <NumberField label="Digits per number" value={settings.digits} min={1} max={3}
                onChange={(v) => setSettings((s) => ({ ...s, digits: v }))} />
              <NumberField label="Numbers per question" value={settings.termCount} min={2} max={10}
                onChange={(v) => setSettings((s) => ({ ...s, termCount: v }))} />
              <NumberField label="Number of questions" value={settings.questionCount} min={1} max={20}
                onChange={(v) => setSettings((s) => ({ ...s, questionCount: v }))} />

              <div>
                <span className="block text-rosewood/60 font-semibold mb-1.5 font-display text-xs uppercase tracking-wide">
                  Display speed
                </span>
                <div className="flex flex-wrap gap-2">
                  {SPEED_PRESETS.map((p) => (
                    <button
                      key={p.ms}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, speedMs: p.ms }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-display border ${
                        settings.speedMs === p.ms
                          ? 'bg-saffron border-saffron text-rosewood-dark'
                          : 'bg-white border-sandalwood/50 text-rosewood/70'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-rosewood/60 font-semibold mb-1.5 font-display text-xs uppercase tracking-wide">
                  Mode
                </span>
                <div className="flex gap-2">
                  {[['addition', 'Addition only'], ['subtraction', 'Subtraction only'], ['mixed', 'Mixed']].map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, mode: v }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-display border ${
                        settings.mode === v
                          ? 'bg-teal border-teal text-white'
                          : 'bg-white border-sandalwood/50 text-rosewood/70'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={start}
                className="w-full mt-2 px-5 py-3 rounded-xl bg-saffron text-rosewood-dark font-bold font-display hover:bg-saffron-dark transition-colors"
              >
                Start
              </button>
            </div>
          )}

          {phase === 'flashing' && sequence && (
            <div className="text-center">
              <p className="text-sm text-rosewood/40 font-body mb-2">
                Question {questionNum} / {settings.questionCount}
              </p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={flashIndex}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.15 }}
                  className="text-6xl font-mono font-extrabold text-teal-dark"
                >
                  {sequence.terms[flashIndex]?.sign === '-' ? '−' : '+'}
                  {sequence.terms[flashIndex]?.value}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {phase === 'answer' && (
            <div className="text-center">
              <p className="text-rosewood/70 font-body mb-4">What's the total?</p>
              <input
                type="number"
                autoFocus
                value={given}
                onChange={(e) => setGiven(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                className="w-40 text-center text-3xl font-mono font-bold border-2 border-sandalwood/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-saffron mx-auto block"
              />
              <button
                type="button"
                onClick={submitAnswer}
                className="mt-4 px-5 py-2.5 rounded-xl bg-teal text-white font-bold font-display hover:bg-teal-dark transition-colors"
              >
                Submit
              </button>
            </div>
          )}

          {phase === 'roundResult' && (
            <div className="text-center">
              {results[results.length - 1]?.correct ? (
                <p className="text-2xl font-display font-bold text-teal-dark mb-2">✓ Correct!</p>
              ) : (
                <p className="text-2xl font-display font-bold text-saffron-dark mb-2">
                  Answer: {results[results.length - 1]?.answer}
                </p>
              )}
              <button
                type="button"
                onClick={nextQuestion}
                className="mt-3 px-5 py-2.5 rounded-xl bg-saffron text-rosewood-dark font-bold font-display hover:bg-saffron-dark transition-colors"
              >
                {questionNum >= settings.questionCount ? 'See results' : 'Next question'}
              </button>
            </div>
          )}

          {phase === 'summary' && (
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-rosewood mb-2">
                {results.filter((r) => r.correct).length} / {results.length} correct
              </h2>
              <p className="text-rosewood/60 font-body mb-6">
                {Math.round((results.filter((r) => r.correct).length / results.length) * 100)}% accuracy
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setPhase('settings')}
                  className="px-4 py-2.5 rounded-xl bg-ivory-dim text-rosewood font-semibold font-display border border-sandalwood/50"
                >
                  Change settings
                </button>
                <button
                  type="button"
                  onClick={start}
                  className="px-4 py-2.5 rounded-xl bg-saffron text-rosewood-dark font-bold font-display hover:bg-saffron-dark"
                >
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }) {
  return (
    <label className="block">
      <span className="block text-rosewood/60 font-semibold mb-1.5 font-display text-xs uppercase tracking-wide">
        {label}: <span className="text-rosewood">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal"
      />
    </label>
  );
}
