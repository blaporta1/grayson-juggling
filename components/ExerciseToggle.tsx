'use client';

import type { ExerciseDefinition } from '@/lib/types';

interface Props {
  exercise: ExerciseDefinition;
  checked: boolean;
  onChange: (key: string, value: boolean) => void;
}

export default function ExerciseToggle({ exercise, checked, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(exercise.key, !checked)}
      className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 w-full text-left active:scale-95 ${
        checked
          ? 'border-pitch-500 bg-pitch-500/10'
          : 'border-gray-700 bg-gray-900 hover:border-gray-600'
      }`}
    >
      {/* Emoji icon */}
      <span className="text-2xl leading-none select-none">{exercise.emoji}</span>

      {/* Label */}
      <span className={`flex-1 font-semibold text-base ${checked ? 'text-white' : 'text-gray-300'}`}>
        {exercise.label}
      </span>

      {/* Checkmark */}
      <span
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          checked
            ? 'bg-pitch-500 border-pitch-500'
            : 'border-gray-600'
        }`}
      >
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
    </button>
  );
}
