// Unlimited dynamically generated exercises for the Practice page,
// Speed Challenge, and lesson Test steps.

const RANGES = {
  easy: [1, 9],
  medium: [10, 99],
  hard: [100, 999],
  expert: [1000, 9999],
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRepresentation(difficulty) {
  const [min, max] = RANGES[difficulty] || RANGES.easy;
  const value = randInt(min, max);
  return { prompt: `Show the number ${value.toLocaleString('en-IN')} on the abacus.`, answer: value };
}

function generateAddition(difficulty) {
  const [min, max] = RANGES[difficulty] || RANGES.easy;
  const a = randInt(min, max);
  const b = randInt(min, max);
  return { prompt: `${a} + ${b} = ?`, answer: a + b };
}

function generateSubtraction(difficulty) {
  const [min, max] = RANGES[difficulty] || RANGES.easy;
  let a = randInt(min, max);
  let b = randInt(min, max);
  if (b > a) [a, b] = [b, a];
  return { prompt: `${a} − ${b} = ?`, answer: a - b };
}

function generateMultiplication(difficulty) {
  const table = {
    easy: () => [randInt(1, 9), randInt(1, 9)],
    medium: () => [randInt(10, 99), randInt(2, 9)],
    hard: () => [randInt(10, 99), randInt(10, 99)],
    expert: () => [randInt(100, 999), randInt(2, 99)],
  };
  const [a, b] = (table[difficulty] || table.easy)();
  return { prompt: `${a} × ${b} = ?`, answer: a * b };
}

function generateDivision(difficulty) {
  const table = {
    easy: () => [randInt(1, 9), randInt(1, 9)],
    medium: () => [randInt(2, 9), randInt(10, 20)],
    hard: () => [randInt(2, 20), randInt(10, 50)],
    expert: () => [randInt(2, 50), randInt(20, 200)],
  };
  const [divisor, quotient] = (table[difficulty] || table.easy)();
  const dividend = divisor * quotient;
  return { prompt: `${dividend} ÷ ${divisor} = ?`, answer: quotient };
}

function generateComplement(difficulty) {
  // Pairs deliberately chosen so the rod fills past 5 or past 10,
  // forcing the complement technique rather than a direct bead push.
  if (difficulty === 'easy' || difficulty === 'medium') {
    const a = randInt(1, 4);
    const b = randInt(5 - a + 1, 9 - a); // crosses the 5-boundary on the rod
    return { prompt: `${a} + ${b} = ?`, answer: a + b };
  }
  const a = randInt(1, 9);
  const b = randInt(10 - a, 9); // crosses the 10-boundary, forces a carry
  return { prompt: `${a} + ${b} = ?`, answer: a + b };
}

function generateMixed(difficulty) {
  const generators = [generateAddition, generateSubtraction, generateMultiplication, generateDivision];
  const pick = generators[randInt(0, generators.length - 1)];
  return pick(difficulty);
}

function generateSpeed(difficulty) {
  // Small, fast mental-arithmetic items for timed modes — one step below
  // the requested difficulty's number size so a 60-second round stays
  // genuinely playable rather than bottlenecked by big multiplications.
  const step = { easy: 'easy', medium: 'easy', hard: 'medium', expert: 'hard' }[difficulty] || 'easy';
  return Math.random() < 0.5 ? generateAddition(step) : generateSubtraction(step);
}

const GENERATORS = {
  representation: generateRepresentation,
  addition: generateAddition,
  subtraction: generateSubtraction,
  multiplication: generateMultiplication,
  division: generateDivision,
  complement: generateComplement,
  mixed: generateMixed,
  speed: generateSpeed,
};

export const CATEGORIES = Object.keys(GENERATORS);
export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

export function generateExercise(category, difficulty = 'easy') {
  const gen = GENERATORS[category] || generateMixed;
  return { category, difficulty, ...gen(difficulty) };
}

export function generateSet(category, difficulty, count) {
  return Array.from({ length: count }, () => generateExercise(category, difficulty));
}
