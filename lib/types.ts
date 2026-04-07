export interface Workout {
  id: number;
  date: string; // YYYY-MM-DD
  juggles: number;
  neymar: boolean;
  outsideInside: boolean;
  atws: boolean;
  plyometrics: boolean;
  splitLunges: boolean;
  pogos: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ExerciseKey =
  | 'neymar'
  | 'outsideInside'
  | 'atws'
  | 'plyometrics'
  | 'splitLunges'
  | 'pogos';

export interface ExerciseDefinition {
  key: ExerciseKey;
  label: string;
  emoji: string;
  color: string;
}

export const EXERCISES: ExerciseDefinition[] = [
  { key: 'neymar',       label: 'Neymar',        emoji: '⚡', color: '#f59e0b' },
  { key: 'outsideInside',label: 'Outside Inside', emoji: '🔄', color: '#3b82f6' },
  { key: 'atws',         label: 'ATWs',           emoji: '🌀', color: '#8b5cf6' },
  { key: 'plyometrics',  label: 'Plyometrics',    emoji: '🏋️', color: '#ef4444' },
  { key: 'splitLunges',  label: 'Split Lunges',   emoji: '🦵', color: '#f97316' },
  { key: 'pogos',        label: 'Pogos',          emoji: '⬆️', color: '#22c55e' },
];

export interface Stats {
  streak: number;
  personalBest: number;
  weeklyJuggles: number;
  weeklyWorkouts: number;
}
