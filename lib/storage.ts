/**
 * Browser localStorage data layer.
 * All workout data is stored locally on the device — no server required.
 */

import type { Workout } from './types';

const KEY = 'grayson_workouts';

export function loadWorkouts(): Workout[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Workout[]) : [];
  } catch {
    return [];
  }
}

function saveWorkouts(workouts: Workout[]) {
  localStorage.setItem(KEY, JSON.stringify(workouts));
}

function nextId(workouts: Workout[]): number {
  return workouts.reduce((m, w) => Math.max(m, w.id), 0) + 1;
}

export function getWorkoutByDate(date: string): Workout | null {
  return loadWorkouts().find(w => w.date === date) ?? null;
}

export function getWorkoutsInRange(start: string, end: string): Workout[] {
  return loadWorkouts()
    .filter(w => w.date >= start && w.date <= end)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllWorkoutsSorted(): Workout[] {
  return loadWorkouts().sort((a, b) => b.date.localeCompare(a.date));
}

export function upsertWorkout(data: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Workout {
  const workouts = loadWorkouts();
  const now = new Date().toISOString();
  const idx = workouts.findIndex(w => w.date === data.date);

  if (idx >= 0) {
    workouts[idx] = { ...workouts[idx], ...data, updatedAt: now };
    saveWorkouts(workouts);
    return workouts[idx];
  }

  const workout: Workout = { id: nextId(workouts), createdAt: now, updatedAt: now, ...data };
  workouts.push(workout);
  saveWorkouts(workouts);
  return workout;
}

export function getStats(): { streak: number; personalBest: number; totalWorkouts: number } {
  const workouts = loadWorkouts();
  const personalBest  = workouts.reduce((m, w) => Math.max(m, w.juggles), 0);
  const totalWorkouts = workouts.length;

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
