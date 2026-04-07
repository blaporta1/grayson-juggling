/**
 * JSON-file database — no native bindings required.
 * Data lives in  ./data/workouts.json
 *
 * For a single-user app this is perfectly reliable; writes are synchronous
 * so there's no race condition risk in the Next.js dev server.
 */

import fs   from 'fs';
import path from 'path';
import type { Workout } from './types';

// ── Storage helpers ────────────────────────────────────────────────────────

const DATA_DIR  = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'workouts.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readAll(): Workout[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Workout[];
  } catch {
    return [];
  }
}

function writeAll(workouts: Workout[]) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(workouts, null, 2), 'utf8');
}

let _nextId = -1;
function nextId(workouts: Workout[]): number {
  if (_nextId === -1) {
    _nextId = workouts.reduce((m, w) => Math.max(m, w.id), 0) + 1;
  }
  return _nextId++;
}

// ── Public API ─────────────────────────────────────────────────────────────

export function getAllWorkouts(): Workout[] {
  return readAll().sort((a, b) => b.date.localeCompare(a.date));
}

export function getWorkoutByDate(date: string): Workout | null {
  return readAll().find(w => w.date === date) ?? null;
}

export function getWorkoutsInRange(start: string, end: string): Workout[] {
  return readAll()
    .filter(w => w.date >= start && w.date <= end)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function upsertWorkout(data: {
  date: string;
  juggles: number;
  neymar: boolean;
  outsideInside: boolean;
  atws: boolean;
  plyometrics: boolean;
  splitLunges: boolean;
  pogos: boolean;
}): Workout {
  const workouts = readAll();
  const now = new Date().toISOString();
  const idx = workouts.findIndex(w => w.date === data.date);

  if (idx >= 0) {
    workouts[idx] = { ...workouts[idx], ...data, updatedAt: now };
    writeAll(workouts);
    return workouts[idx];
  }

  const workout: Workout = {
    id:        nextId(workouts),
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  workouts.push(workout);
  writeAll(workouts);
  return workout;
}

export function getStats(): {
  streak: number;
  personalBest: number;
  totalWorkouts: number;
} {
  const workouts = readAll();
  const personalBest = workouts.reduce((m, w) => Math.max(m, w.juggles), 0);
  const totalWorkouts = workouts.length;

  // Sort dates descending for streak calculation
  const dates = workouts.map(w => w.date).sort((a, b) => b.localeCompare(a));
  const today     = localDateString(new Date());
  const yesterday = localDateString(new Date(Date.now() - 86_400_000));

  let streak = 0;
  if (dates.length > 0 && (dates[0] === today || dates[0] === yesterday)) {
    const dateSet = new Set(dates);
    let cursor = new Date(dates[0] + 'T00:00:00');
    while (dateSet.has(localDateString(cursor))) {
      streak++;
      cursor = new Date(cursor.getTime() - 86_400_000);
    }
  }

  return { streak, personalBest, totalWorkouts };
}

export function localDateString(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}
