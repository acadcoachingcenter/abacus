// Curriculum tree for the lesson engine. Client-side data for now — this
// mirrors the shape of the levels/courses/lessons D1 tables in schema.sql,
// so migrating to admin-managed content later (Phase 6) is a data-source
// swap, not a rewrite of the lesson player.
//
// Each lesson follows Learn -> Watch -> Practice -> Test. `watch` and
// `practice` describe a target value to build on the abacus; `test` is a
// practice-generator category+difficulty used to generate real questions.

export const LEVELS = [
  { id: 'beginner', name: 'Beginner', order: 1 },
  { id: 'intermediate', name: 'Intermediate', order: 2 },
  { id: 'advanced', name: 'Advanced', order: 3 },
];

export const LESSONS = [
  // ---------------------------------------------------------------- BEGINNER
  {
    id: 'parts-of-the-abacus',
    level: 'beginner',
    title: 'Parts of the Abacus',
    learn:
      'A soroban has three parts: the heaven bead above the bar (worth 5), the four earth beads below the bar (worth 1 each), and the reckoning bar itself, which separates them. A bead only counts toward the value when it is pushed to touch the bar.',
    watch: { targetValue: 5, rodCount: 1 },
    practice: { targetValue: 5, rodCount: 1, prompt: 'Push the heaven bead down to show 5.' },
    test: { category: 'representation', difficulty: 'easy', questions: 3, rodCount: 1 },
  },
  {
    id: 'bead-values',
    level: 'beginner',
    title: 'Bead Values',
    learn:
      'Each earth bead is worth 1. Push one, two, three, or all four up to the bar to make 1, 2, 3, or 4. The heaven bead is worth 5 on its own — combine it with earth beads for 6, 7, 8, or 9.',
    watch: { targetValue: 7, rodCount: 1 },
    practice: { targetValue: 8, rodCount: 1, prompt: 'Show the number 8 using one heaven bead and three earth beads.' },
    test: { category: 'representation', difficulty: 'easy', questions: 4, rodCount: 1 },
  },
  {
    id: 'numbers-0-99',
    level: 'beginner',
    title: 'Numbers 0–99',
    learn:
      'Two rods let you show numbers up to 99. The rod on the right is the ones place, the rod to its left is the tens place — exactly like the digits in the number itself.',
    watch: { targetValue: 34, rodCount: 2 },
    practice: { targetValue: 58, rodCount: 2, prompt: 'Build 58 using both rods.' },
    test: { category: 'representation', difficulty: 'medium', questions: 4, rodCount: 2 },
  },
  {
    id: 'numbers-100-999',
    level: 'beginner',
    title: 'Numbers 100–999',
    learn:
      'A third rod adds the hundreds place. Reading left to right, the rods always match the digits of the number: hundreds, tens, ones.',
    watch: { targetValue: 246, rodCount: 3 },
    practice: { targetValue: 507, rodCount: 3, prompt: 'Build 507 — remember the tens rod stays empty.' },
    test: { category: 'representation', difficulty: 'medium', questions: 4, rodCount: 3 },
  },
  {
    id: 'simple-addition',
    level: 'beginner',
    title: 'Simple Addition',
    learn:
      'To add, build the first number, then push in more earth or heaven beads for the second number — as long as each rod has enough beads left to move, no carrying is needed yet.',
    watch: { targetValue: 3, rodCount: 2, addTo: 2 },
    practice: { targetValue: 7, rodCount: 2, prompt: 'Build 4, then add 3 more to make 7.' },
    test: { category: 'addition', difficulty: 'easy', questions: 5, rodCount: 2 },
  },
  {
    id: 'simple-subtraction',
    level: 'beginner',
    title: 'Simple Subtraction',
    learn:
      'To subtract, build the first number, then push beads away from the bar for the amount you are taking away.',
    watch: { targetValue: 4, rodCount: 2 },
    practice: { targetValue: 2, rodCount: 2, prompt: 'Build 6, then take away 4 to leave 2.' },
    test: { category: 'subtraction', difficulty: 'easy', questions: 5, rodCount: 2 },
  },

  // ------------------------------------------------------------ INTERMEDIATE
  {
    id: 'complement-of-5',
    level: 'intermediate',
    title: 'Complement of 5',
    learn:
      'When a rod does not have enough earth beads left to add a number directly, use the complement of 5 instead: to add 4, you can instead add 5 and subtract 1 (since 4 = 5 − 1). This lets you use the heaven bead when the earth beads are full.',
    watch: { targetValue: 5, rodCount: 1 },
    practice: { targetValue: 9, rodCount: 1, prompt: 'Starting from 4, add 5 using the complement trick to reach 9.' },
    test: { category: 'complement', difficulty: 'medium', questions: 5, rodCount: 2 },
  },
  {
    id: 'complement-of-10',
    level: 'intermediate',
    title: 'Complement of 10',
    learn:
      'When a rod is full and you still need to add, use the complement of 10: to add 8, add 10 to the next rod to the left and subtract 2 from this rod (since 8 = 10 − 2). This is how carrying works on a soroban.',
    watch: { targetValue: 12, rodCount: 2 },
    practice: { targetValue: 15, rodCount: 2, prompt: 'Starting from 7, add 8 using the complement of 10.' },
    test: { category: 'complement', difficulty: 'hard', questions: 5, rodCount: 3 },
  },
  {
    id: 'carrying',
    level: 'intermediate',
    title: 'Carrying',
    learn:
      'When adding pushes a rod past 9, the extra amount "carries" one bead into the next rod to the left — exactly like carrying in written addition, but done bead by bead.',
    watch: { targetValue: 23, rodCount: 3, addTo: 8 },
    practice: { targetValue: 31, rodCount: 3, prompt: 'Add 18 + 13, carrying into the tens rod as needed.' },
    test: { category: 'addition', difficulty: 'hard', questions: 6, rodCount: 3 },
  },
  {
    id: 'borrowing',
    level: 'intermediate',
    title: 'Borrowing',
    learn:
      'When subtracting takes a rod below zero, "borrow" one bead from the rod to the left — it becomes worth 10 on the current rod, the same idea as borrowing in written subtraction.',
    watch: { targetValue: 17, rodCount: 3 },
    practice: { targetValue: 24, rodCount: 3, prompt: 'Subtract 18 from 42, borrowing where needed.' },
    test: { category: 'subtraction', difficulty: 'hard', questions: 6, rodCount: 3 },
  },
  {
    id: 'multiplication-intro',
    level: 'intermediate',
    title: 'Multiplication',
    learn:
      'Multiplication on the abacus is repeated addition, organized by place value — a single-digit number multiplied by a single-digit number, built up one partial product at a time.',
    watch: { targetValue: 24, rodCount: 3 },
    practice: { targetValue: 24, rodCount: 3, prompt: 'Build the answer to 6 × 4 = 24.' },
    test: { category: 'multiplication', difficulty: 'medium', questions: 6, rodCount: 3 },
  },
  {
    id: 'division-intro',
    level: 'intermediate',
    title: 'Division',
    learn:
      'Division works in reverse: subtract the divisor repeatedly (or by place value) until nothing is left, counting how many times you subtracted.',
    watch: { targetValue: 6, rodCount: 2 },
    practice: { targetValue: 6, rodCount: 2, prompt: 'Build the answer to 42 ÷ 7 = 6.' },
    test: { category: 'division', difficulty: 'medium', questions: 6, rodCount: 3 },
  },

  // ----------------------------------------------------------------- ADVANCED
  {
    id: 'speed-calculation',
    level: 'advanced',
    title: 'Speed Calculation',
    learn:
      'At speed, you stop watching individual beads and start recognizing whole-hand shapes — the goal is to move several beads in one motion using muscle memory built from complements.',
    watch: { targetValue: 47, rodCount: 3 },
    practice: { targetValue: 68, rodCount: 3, prompt: 'Build 68 as quickly as you can, in one motion per rod.' },
    test: { category: 'mixed', difficulty: 'hard', questions: 8, rodCount: 3 },
  },
  {
    id: 'large-numbers',
    level: 'advanced',
    title: 'Large Numbers',
    learn:
      'The same place-value logic extends to any number of rods — thousands, ten-thousands, and beyond all follow the identical left-to-right pattern.',
    watch: { targetValue: 3204, rodCount: 5 },
    practice: { targetValue: 15870, rodCount: 5, prompt: 'Build 15,870 across five rods.' },
    test: { category: 'representation', difficulty: 'expert', questions: 5, rodCount: 5 },
  },
  {
    id: 'mixed-arithmetic',
    level: 'advanced',
    title: 'Mixed Arithmetic',
    learn:
      'Real problems combine addition, subtraction, and complements in sequence — the skill is tracking the running value on the abacus through several operations without resetting.',
    watch: { targetValue: 19, rodCount: 3 },
    practice: { targetValue: 19, rodCount: 3, prompt: 'Solve 25 + 8 − 14 in one continuous sequence.' },
    test: { category: 'mixed', difficulty: 'expert', questions: 8, rodCount: 3 },
  },
];

export function lessonsByLevel(levelId) {
  return LESSONS.filter((l) => l.level === levelId);
}

export function getLesson(id) {
  return LESSONS.find((l) => l.id === id) || null;
}

// Topics named in the spec that don't have a full lesson yet — shown as
// "coming soon" so the curriculum page is honest about what's built.
export const UPCOMING_TOPICS = {
  beginner: ['Introduction to Abacus', 'Number representation practice sets'],
  intermediate: ['Multi-digit calculations'],
  advanced: ['Mental visualization', 'Flash Anzan (see the Flash page)', 'Timed challenges (see the Challenge page)'],
};
