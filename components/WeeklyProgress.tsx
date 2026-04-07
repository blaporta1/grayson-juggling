'use client';

import { useMemo } from 'react';
import type { Workout } from '@/lib/types';
import { EXERCISES } from '@/lib/types';
import { startOfWeek, endOfWeek, parseISO, isWithinInterval, format } from 'date-fns';

interface Props {
  workouts: Workout[];
}

export default function WeeklyProgress({ workouts }: Props) {
  const weekData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const weekEnd   = endOfWeek(now,   { weekStartsOn: 1 });

    const thisWeek = workouts.filter(w => {
      try {
        return isWithinInterval(parseISO(w.date), { start: weekStart, end: weekEnd });
      } catch { return false; }
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayData = days.map((day, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const workout = thisWeek.find(w => w.date === dateStr);
      return { day, dateStr, workout, isToday: dateStr === format(now, 'yyyy-MM-dd') };
    });

    const totalJuggles = thisWeek.reduce((sum, w) => sum + w.juggles, 0);
    const exerciseCounts: Record<string, number> = {};
    for (const ex of EXERCISES) {
      exerciseCounts[ex.key] = thisWeek.filter(w => w[ex.key as keyof Workout]).length;
    }

    return { dayData, totalJuggles, exerciseCounts, workoutCount: thisWeek.length };
  }, [workouts]);

  return (
    <div className="space-y-4">
      {/* Day dots */}
      <div className="flex justify-between gap-1">
        {weekData.dayData.map(({ day, workout, isToday }) => (
          <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                workout
                  ? 'bg-pitch-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                  : isToday
                  ? 'border-2 border-pitch-500 text-pitch-500'
                  : 'bg-gray-800 text-gray-600'
              }`}
            >
              {workout ? '✓' : day[0]}
            </div>
            <span className={`text-[10px] ${isToday ? 'text-pitch-500 font-semibold' : 'text-gray-600'}`}>
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Weekly stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Days" value={`${weekData.workoutCount}/7`} />
        <StatPill label="Juggles" value={weekData.totalJuggles.toLocaleString()} highlight />
        <StatPill
          label="Exercises"
          value={`${Object.values(weekData.exerciseCounts).filter(v => v > 0).length}/${EXERCISES.length}`}
        />
      </div>
    </div>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-pitch-500/15 border border-pitch-500/30' : 'bg-gray-900'}`}>
      <div className={`text-lg font-bold ${highlight ? 'text-pitch-500' : 'text-white'}`}>{value}</div>
      <div className="text-gray-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}
