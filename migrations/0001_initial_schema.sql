-- ACAD Abacus — Cloudflare D1 schema
-- NOT YET APPLIED / NOT YET WIRED TO THE APP.
-- This is the target schema for Phase 5 (progress tracking) and
-- Phase 6 (admin + class management). Phase 1-2 (this delivery) is
-- fully local/client-side and needs no database.
--
-- Apply later with:
--   wrangler d1 create acad-abacus
--   wrangler d1 execute acad-abacus --file=./schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  disabled INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER,
  grade TEXT,
  current_level TEXT NOT NULL DEFAULT 'beginner',
  streak_days INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  total_practice_seconds INTEGER NOT NULL DEFAULT 0,
  last_activity_at TEXT
);

CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
  level TEXT NOT NULL,
  schedule TEXT,
  start_date TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed'))
);

CREATE TABLE IF NOT EXISTS class_students (
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (class_id, student_id)
);

CREATE TABLE IF NOT EXISTS levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  level_id TEXT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_json TEXT NOT NULL, -- learn/watch/practice/test steps
  order_index INTEGER NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- representation | addition | subtraction | multiplication | division | mixed | complement | speed
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  prompt TEXT NOT NULL,
  answer INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS student_progress (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER,
  completed_at TEXT,
  UNIQUE (student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS practice_answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT REFERENCES exercises(id) ON DELETE SET NULL,
  given_answer INTEGER,
  correct INTEGER NOT NULL,
  answered_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS challenge_results (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('speed_challenge', 'flash_anzan')),
  score INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  best_streak INTEGER NOT NULL DEFAULT 0,
  avg_time_per_question REAL,
  played_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS student_achievements (
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (student_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_class_students_student ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON practice_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_challenge_student ON challenge_results(student_id);
