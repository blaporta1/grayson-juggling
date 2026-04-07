'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Workout } from '@/lib/types';
import { EXERCISES } from '@/lib/types';
import { getAllWorkoutsSorted, getWorkoutsInRange, localDateString } from '@/lib/storage';

type FilterMode = 'all' | 'week' | 'month';

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filter,   setFilter]   = useState<FilterMode>('all');
  const [refDate,  setRefDate]  = useState(new Date());
  const today = localDateString(new Date());

  useEffect(() => {
    if (filter === 'all') {
      setWorkouts(getAllWorkoutsSorted());
    } else if (filter === 'week') {
      const s = format(startOfWeek(refDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const e = format(endOfWeek(refDate,   { weekStartsOn: 1 }), 'yyyy-MM-dd');
      setWorkouts(getWorkoutsInRange(s, e));
    } else {
      const s = format(startOfMonth(refDate), 'yyyy-MM-dd');
      const e = format(endOfMonth(refDate),   'yyyy-MM-dd');
      setWorkouts(getWorkoutsInRange(s, e));
    }
  }, [filter, refDate]);

  function shift(dir: -1 | 1) {
    setRefDate(prev => {
      const d = new Date(prev);
      if (filter === 'week')  d.setDate(d.getDate() + dir * 7);
      if (filter === 'month') d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  const periodLabel =
    filter === 'week'
      ? `${format(startOfWeek(refDate, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(refDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`
      : filter === 'month'
      ? format(refDate, 'MMMM yyyy')
      : 'All Workouts';

  const totalJuggles = workouts.reduce((s, w) => s + w.juggles, 0);

  return (
    <div className="pt-5 space-y-5 animate-[slide-up_0.3s_ease-out]">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-extrabold text-white">History</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-gray-900 rounded-2xl p-1 border border-gray-800 gap-1">
        {(['all', 'week', 'month'] as FilterMode[]).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setRefDate(new Date()); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f ? 'bg-pitch-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Period navigator */}
      {filter !== 'all' && (
        <div className="flex items-center justify-between bg-gray-900 rounded-2xl px-4 py-3 border border-gray-800">
          <button onClick={() => shift(-1)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-white font-semibold text-sm">{periodLabel}</span>
          <button onClick={() => shift(1)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Summary */}
      {workouts.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900 rounded-2xl p-3 border border-gray-800 text-center">
            <div className="text-2xl font-black text-white">{workouts.length}</div>
            <div className="text-gray-500 text-xs mt-0.5">Workouts</div>
          </div>
          <div className="bg-pitch-500/10 rounded-2xl p-3 border border-pitch-500/30 text-center">
            <div className="text-2xl font-black text-pitch-500">{totalJuggles.toLocaleString()}</div>
            <div className="text-gray-500 text-xs mt-0.5">Total Juggles</div>
          </div>
        </div>
      )}

      {/* List */}
      {workouts.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-gray-400">No workouts found</p>
          <Link href="/workout" className="inline-block mt-3 text-pitch-500 text-sm font-medium">
            Log one now →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {workouts.map(w => (
            <WorkoutCard key={w.id} workout={w} isToday={w.date === today} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ workout, isToday }: { workout: Workout; isToday: boolean }) {
  const completed = EXERCISES.filter(ex => workout[ex.key as keyof Workout]);
  const dateLabel = isToday
    ? 'Today'
    : format(parseISO(workout.date), 'EEEE, MMMM d, yyyy');

  return (
    <div className={`bg-gray-900 rounded-2xl p-4 border ${isToday ? 'border-pitch-500/40' : 'border-gray-800'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`font-bold text-sm ${isToday ? 'text-pitch-400' : 'text-white'}`}>{dateLabel}</p>
          {isToday && <span className="text-xs bg-pitch-500/20 text-pitch-400 px-2 py-0.5 rounded-full">Today</span>}
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-pitch-500 tabular-nums">{workout.juggles.toLocaleString()}</span>
          <p className="text-gray-500 text-xs">juggles</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EXERCISES.map(ex => {
          const done = Boolean(workout[ex.key as keyof Workout]);
          return (
            <span
              key={ex.key}
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                done
                  ? 'bg-pitch-500/15 text-pitch-400 border border-pitch-500/30'
                  : 'bg-gray-800 text-gray-600'
              }`}
            >
              {ex.emoji} {ex.label}
            </span>
          );
        })}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{completed.length}/{EXERCISES.length} exercises</span>
          <span>{Math.round((completed.length / EXERCISES.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-pitch-500 rounded-full transition-all"
            style={{ width: `${(completed.length / EXERCISES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
