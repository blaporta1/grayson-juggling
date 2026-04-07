'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Minus, Plus, Save, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { Workout } from '@/lib/types';
import { EXERCISES, type ExerciseKey } from '@/lib/types';
import ExerciseToggle from '@/components/ExerciseToggle';

type ExerciseState = Record<ExerciseKey, boolean>;

const DEFAULT_EXERCISES: ExerciseState = {
  neymar: false, outsideInside: false, atws: false,
  plyometrics: false, splitLunges: false, pogos: false,
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkoutPage() {
  const router = useRouter();
  const today = todayStr();

  const [juggles,   setJuggles]   = useState(0);
  const [exercises, setExercises] = useState<ExerciseState>(DEFAULT_EXERCISES);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [rawInput,  setRawInput]  = useState('0');

  // Load existing workout for today if it exists
  const loadToday = useCallback(async () => {
    const res = await fetch(`/api/workouts/${today}`);
    if (!res.ok) return;
    const data: Workout | null = await res.json();
    if (data) {
      setJuggles(data.juggles);
      setRawInput(String(data.juggles));
      setExercises({
        neymar:        data.neymar,
        outsideInside: data.outsideInside,
        atws:          data.atws,
        plyometrics:   data.plyometrics,
        splitLunges:   data.splitLunges,
        pogos:         data.pogos,
      });
    }
  }, [today]);

  useEffect(() => { loadToday(); }, [loadToday]);

  function adjustJuggles(delta: number) {
    const next = Math.max(0, juggles + delta);
    setJuggles(next);
    setRawInput(String(next));
    setSaved(false);
  }

  function handleInputChange(val: string) {
    setRawInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0) {
      setJuggles(n);
      setSaved(false);
    }
  }

  function handleExerciseChange(key: string, value: boolean) {
    setExercises(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, juggles, ...exercises }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      console.error(err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
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
            {/* Decrement */}
            <div className="flex gap-1.5">
              <CounterBtn label="-10" onClick={() => adjustJuggles(-10)} />
              <CounterBtn label="-1"  onClick={() => adjustJuggles(-1)} />
            </div>

            {/* Number input */}
            <input
              type="number"
              value={rawInput}
              onChange={e => handleInputChange(e.target.value)}
              onFocus={e => e.target.select()}
              className="flex-1 text-center text-5xl font-black text-pitch-500 bg-transparent border-none outline-none tabular-nums caret-pitch-500"
              min={0}
            />

            {/* Increment */}
            <div className="flex gap-1.5">
              <CounterBtn label="+1"  onClick={() => adjustJuggles(1)} />
              <CounterBtn label="+10" onClick={() => adjustJuggles(10)} />
            </div>
          </div>

          {/* Quick set presets */}
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

        {/* Select all / none */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              const allOn = Object.fromEntries(EXERCISES.map(e => [e.key, true])) as ExerciseState;
              setExercises(allOn); setSaved(false);
            }}
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

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-2 ${
          saved
            ? 'bg-pitch-600 text-white'
            : 'bg-pitch-500 text-white active:scale-95 hover:bg-pitch-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
        } disabled:opacity-70`}
      >
        {saved ? (
          <><CheckCircle2 size={20} /> Saved! Redirecting...</>
        ) : saving ? (
          <><span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Saving...</>
        ) : (
          <><Save size={20} /> Save Workout</>
        )}
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
