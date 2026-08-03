import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SorobanAbacus from '../abacus/SorobanAbacus';
import { getLesson } from '../../data/curriculum';
import { generateSet } from '../../utils/practiceGenerator';

const STEPS = ['learn', 'watch', 'practice', 'test', 'result'];

export default function LessonPlayer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const abacusRef = useRef(null);

  const testQuestions = useMemo(() => {
    if (!lesson) return [];
    return generateSet(lesson.test.category, lesson.test.difficulty, lesson.test.questions);
  }, [lesson]);
  const [testIndex, setTestIndex] = useState(0);
  const [testCorrect, setTestCorrect] = useState(0);
  const [testFeedback, setTestFeedback] = useState(null);

  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [watching, setWatching] = useState(false);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-rosewood/70 font-body mb-4">That lesson doesn't exist (yet).</p>
        <Link to="/learn" className="text-teal font-semibold underline">Back to curriculum</Link>
      </div>
    );
  }

  const goTo = (idx) => setStepIndex(Math.max(0, Math.min(STEPS.length - 1, idx)));

  const playWatchDemo = () => {
    setWatching(true);
    abacusRef.current?.setValue(0);
    setTimeout(() => {
      abacusRef.current?.setValue(lesson.watch.targetValue);
      setWatching(false);
    }, 700);
  };

  const checkPractice = () => {
    const current = abacusRef.current?.getValue();
    if (current === lesson.practice.targetValue) {
      setPracticeFeedback('correct');
    } else {
      setPracticeFeedback('retry');
    }
  };

  const checkTest = (given) => {
    const q = testQuestions[testIndex];
    const correct = Number(given) === q.answer;
    if (correct) setTestCorrect((c) => c + 1);
    setTestFeedback(correct ? 'correct' : 'retry');
    setTimeout(() => {
      setTestFeedback(null);
      if (testIndex + 1 < testQuestions.length) {
        setTestIndex((i) => i + 1);
        abacusRef.current?.reset();
      } else {
        goTo(4);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <Link to="/learn" className="text-sm text-rosewood/50 hover:text-rosewood font-body">
          ← Back to curriculum
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-rosewood mt-2 mb-1">
          {lesson.title}
        </h1>
        <StepBar current={step} />

        <div className="mt-6 bg-white/70 backdrop-blur rounded-3xl border border-sandalwood/30 p-5 sm:p-7 shadow-sm">
          <AnimatePresence mode="wait">
            {step === 'learn' && (
              <motion.div key="learn" {...fade}>
                <h2 className="font-display font-bold text-lg text-teal-dark mb-3">Learn</h2>
                <p className="text-rosewood/80 font-body leading-relaxed">{lesson.learn}</p>
                <NextButton onClick={() => goTo(1)}>Watch a demo →</NextButton>
              </motion.div>
            )}

            {step === 'watch' && (
              <motion.div key="watch" {...fade}>
                <h2 className="font-display font-bold text-lg text-teal-dark mb-3">Watch</h2>
                <p className="text-rosewood/70 font-body mb-4">
                  Watch the abacus build the number, then try it yourself.
                </p>
                <SorobanAbacus
                  ref={abacusRef}
                  rodCount={lesson.watch.rodCount}
                  label="Demonstration"
                  allowHideValue={false}
                />
                <div className="flex gap-2 mt-4">
                  <SecondaryButton onClick={playWatchDemo} disabled={watching}>
                    {watching ? 'Playing…' : '▶ Play demo'}
                  </SecondaryButton>
                  <NextButton onClick={() => goTo(2)}>Try myself →</NextButton>
                </div>
              </motion.div>
            )}

            {step === 'practice' && (
              <motion.div key="practice" {...fade}>
                <h2 className="font-display font-bold text-lg text-teal-dark mb-3">Practice</h2>
                <p className="text-rosewood/80 font-body mb-4">{lesson.practice.prompt}</p>
                <SorobanAbacus
                  ref={abacusRef}
                  rodCount={lesson.practice.rodCount}
                  label="Your abacus"
                />
                {practiceFeedback && <Feedback status={practiceFeedback} />}
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => abacusRef.current?.setValue(lesson.practice.targetValue)}
                    className="px-4 py-2.5 rounded-xl bg-ivory-dim text-rosewood font-semibold font-display border border-sandalwood/50 hover:bg-sandalwood/20"
                  >
                    Show Hint
                  </button>
                  <SecondaryButton onClick={checkPractice}>Check</SecondaryButton>
                  {practiceFeedback === 'correct' && (
                    <NextButton onClick={() => goTo(3)}>Start test →</NextButton>
                  )}
                </div>
              </motion.div>
            )}

            {step === 'test' && (
              <motion.div key={`test-${testIndex}`} {...fade}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display font-bold text-lg text-teal-dark">Test</h2>
                  <span className="text-sm text-rosewood/50 font-body">
                    Question {testIndex + 1} / {testQuestions.length}
                  </span>
                </div>
                <p className="text-2xl font-mono font-bold text-rosewood mb-4">
                  {testQuestions[testIndex]?.prompt}
                </p>
                <SorobanAbacus
                  ref={abacusRef}
                  rodCount={lesson.test.rodCount}
                  label="Work it out"
                />
                {testFeedback && <Feedback status={testFeedback} />}
                <div className="mt-4">
                  <SecondaryButton onClick={() => checkTest(abacusRef.current?.getValue())}>
                    Submit answer
                  </SecondaryButton>
                </div>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div key="result" {...fade} className="text-center py-6">
                <h2 className="font-display font-bold text-2xl text-rosewood mb-2">
                  {testCorrect} / {testQuestions.length} correct
                </h2>
                <p className="text-rosewood/60 font-body mb-6">
                  {testCorrect === testQuestions.length
                    ? 'Excellent! You made it through the whole test.'
                    : 'Good effort — review the lesson and try again anytime.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <SecondaryButton onClick={() => navigate('/learn')}>Back to curriculum</SecondaryButton>
                  <NextButton onClick={() => window.location.reload()}>Retry lesson</NextButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

function StepBar({ current }) {
  const labels = ['Learn', 'Watch', 'Practice', 'Test'];
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex gap-1.5 mt-3">
      {labels.map((l, i) => (
        <div key={l} className="flex-1">
          <div className={`h-1.5 rounded-full ${i <= idx ? 'bg-saffron' : 'bg-sandalwood/25'}`} />
          <span className={`text-[11px] font-display font-semibold ${i <= idx ? 'text-rosewood' : 'text-rosewood/30'}`}>
            {l}
          </span>
        </div>
      ))}
    </div>
  );
}

function NextButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 px-5 py-2.5 rounded-xl bg-saffron text-rosewood-dark font-bold font-display hover:bg-saffron-dark transition-colors"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2.5 rounded-xl bg-teal text-white font-semibold font-display hover:bg-teal-dark disabled:opacity-50 transition-colors"
    >
      {children}
    </button>
  );
}

function Feedback({ status }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-3 px-4 py-2 rounded-xl text-sm font-semibold font-body inline-block ${
        status === 'correct' ? 'bg-teal/10 text-teal-dark' : 'bg-saffron/15 text-saffron-dark'
      }`}
    >
      {status === 'correct' ? '✓ Correct!' : '✗ Not quite — try again'}
    </motion.div>
  );
}
