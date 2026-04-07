'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { ExerciseKey } from '@/lib/types';
import { EXERCISES } from '@/lib/types';
import { getWorkoutByDate, upsertWorkout, localDateString } from '@/lib/storage';
import ExerciseToggle from '@/components/ExerciseToggle';

type ExerciseState = Record<ExerciseKey, boolean>;

const DEFAULT_EXERCISES: ExerciseState = {
  neymar: false, outsideInside: false, atws: false,
  plyometrics: false, splitLunges: false, pogos: false,
};

export default function WorkoutPage() {
  const router  = useRouter();
  const today   = localDateString(new Date());

  const [juggles,   setJuggles]   = useState(0);
  const [exercises, setExercises] = useState<ExerciseState>(DEFAULT_EXERCISES);
  const [saved,     setSaved]     = useState(false);
  const [rawInput,  setRawInput]  = useState('0');

  useEffect(() => {
    const existing = getWorkoutByDate(today);
    if (existing) {
      setJuggles(existing.juggles);
      setRawInput(String(existing.juggles));
      setExercises({
        neymar:        existing.neymar,
        outsideInside: existing.outsideInside,
        atws:          existing.atws,
        plyometrics:   existing.plyometrics,
        splitLunges:   existing.splitLunges,
        pogos:         existing.pogos,
      });
    }
  }, [today]);

  function adjustJuggles(delta: number) {
    const next = Math.max(0, juggles + delta);
    setJuggles(next);
    setRawInput(String(next));
    setSaved(false);
  }

  function handleInputChange(val: string) {
    setRawInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) { setJuggles(n); setSaved(false); }
  }

  function handleExerciseChange(key: string, value: boolean) {
    setExercises(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    upsertWorkout({ date: today, juggles, ...exercises });
    setSaved(true);
    setTimeout(() => router.push('/'), 1000);
  }

  const completedCount = Object.values(exercises).filter(Boolean).length;

  return (
    <div className="pt-5 pb-8 space-y-6 animate-[slide-up_0.3s_ease-out]">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-white">Log Workout</h1>
          <p className="text-gray-400 text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
      </div>

      {/* Juggle counter */}
      <section>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Juggle Count</h2>
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <CounterBtn label="-10" onClick={() => adjustJuggles(-10)} />
              <CounterBtn label="-1"  onClick={() => adjustJuggles(-1)} />
            </div>

            <input
              type="number"
              value={rawInput}
              onChange={e => handleInputChange(e.target.value)}
              onFocus={e => e.target.select()}
              className="flex-1 text-center text-5xl font-black text-pitch-500 bg-transparent border-none outline-none tabular-nums caret-pitch-500"
              min={0}
            />

            <div className="flex gap-1.5">
              <CounterBtn label="+1"  onClick={() => adjustJuggles(1)} />
              <CounterBtn label="+10" onClick={() => adjustJuggles(10)} />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {[50, 100, 200, 500, 1000].map(n => (
              <button
                key={n}
                onClick={() => { setJuggles(n); setRawInput(String(n)); setSaved(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                  juggles === n
                    ? 'bg-pitch-500 text-white border-pitch-500'
                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Exercises */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Exercises</h2>
          <span className="text-xs text-gray-500">
            {completedCount}/{EXERCISES.length}
            {completedCount === EXERCISES.length && <span className="ml-1 text-pitch-500">🔥</span>}
          </span>
        </div>
        <div className="space-y-2">
          {EXERCISES.map(ex => (
            <ExerciseToggle
              key={ex.key}
              exercise={ex}
              checked={exercises[ex.key]}
              onChange={handleExerciseChange}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { setExercises(Object.fromEntries(EXERCISES.map(e => [e.key, true])) as ExerciseState); setSaved(false); }}
            className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 text-sm hover:border-gray-500 transition-colors"
          >
            All done
          </button>
          <button
            onClick={() => { setExercises(DEFAULT_EXERCISES); setSaved(false); }}
            className="flex-1 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-400 text-sm hover:border-gray-500 transition-colors"
          >
            Clear all
          </button>
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saved}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
          saved
            ? 'bg-pitch-600 text-white'
            : 'bg-pitch-500 text-white active:scale-95 hover:bg-pitch-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        } disabled:opacity-70`}
      >
        {saved
          ? <><CheckCircle2 size={20} /> Saved!</>
          : <><Save size={20} /> Save Workout</>}
      </button>
    </div>
  );
}

function CounterBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm font-bold hover:bg-gray-700 active:scale-90 transition-all"
    >
      {label}
    </button>
  );
}
