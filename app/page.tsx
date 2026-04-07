'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { Flame, Trophy, PlusCircle, ChevronRight } from 'lucide-react';
import type { Workout, Stats } from '@/lib/types';
import { EXERCISES } from '@/lib/types';
import WeeklyProgress from '@/components/WeeklyProgress';

// Recharts uses browser APIs — load only on client
const JugglesChart = dynamic(() => import('@/components/JugglesChart'), { ssr: false });

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats]       = useState<Stats & { totalWorkouts: number }>({ streak: 0, personalBest: 0, weeklyJuggles: 0, weeklyWorkouts: 0, totalWorkouts: 0 });
  const [loading, setLoading]   = useState(true);
  const today = todayStr();
  const todayWorkout = workouts.find(w => w.date === today) ?? null;

  const load = useCallback(async () => {
    const [wRes, sRes] = await Promise.all([
      fetch('/api/workouts'),
      fetch('/api/stats'),
    ]);
    const [ws, st] = await Promise.all([wRes.json(), sRes.json()]);
    setWorkouts(ws);
    setStats(st);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const exercisesDone = todayWorkout
    ? EXERCISES.filter(ex => todayWorkout[ex.key as keyof Workout]).length
    : 0;

  return (
    <div className="space-y-5 pt-6 animate-[slide-up_0.35s_ease-out]">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Grayson's Workouts</h1>
          <p className="text-gray-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="text-3xl select-none">⚽</div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={20} className={stats.streak > 0 ? 'text-orange-400' : 'text-gray-500'} />}
          label="Streak"
          value={stats.streak > 0 ? `${stats.streak} day${stats.streak !== 1 ? 's' : ''}` : '—'}
          sub={stats.streak > 0 ? '🔥 Keep it up!' : 'Start today'}
        />
        <StatCard
          icon={<Trophy size={20} className="text-yellow-400" />}
          label="Personal Best"
          value={stats.personalBest > 0 ? stats.personalBest.toLocaleString() : '—'}
          sub="Juggles"
        />
      </div>

      {/* Today's workout */}
      <section>
        <SectionHeader title="Today" />
        {loading ? (
          <SkeletonCard />
        ) : todayWorkout ? (
          <Link href="/workout" className="block">
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-pitch-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-4xl font-black text-pitch-500 tabular-nums">
                    {todayWorkout.juggles.toLocaleString()}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">juggles</span>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {EXERCISES.map(ex => (
                  <span
                    key={ex.key}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      todayWorkout[ex.key as keyof Workout]
                        ? 'bg-pitch-500/15 text-pitch-400 border border-pitch-500/30'
                        : 'bg-gray-800 text-gray-600'
                    }`}
                  >
                    {ex.emoji} {ex.label}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{exercisesDone}/{EXERCISES.length} exercises completed</p>
            </div>
          </Link>
        ) : (
          <Link href="/workout">
            <div className="bg-gray-900 rounded-2xl p-5 border-2 border-dashed border-gray-700 hover:border-pitch-500/50 transition-colors flex flex-col items-center gap-2 text-center">
              <PlusCircle size={28} className="text-pitch-500" />
              <p className="text-white font-semibold">Log today's workout</p>
              <p className="text-gray-500 text-sm">Tap to get started</p>
            </div>
          </Link>
        )}
      </section>

      {/* Weekly progress */}
      <section>
        <SectionHeader title="This Week" />
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
          {loading ? <div className="h-28 bg-gray-800 rounded-xl animate-pulse" /> : <WeeklyProgress workouts={workouts} />}
        </div>
      </section>

      {/* Juggle trend chart */}
      {workouts.length >= 2 && (
        <section>
          <SectionHeader title="Juggle Trend" />
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <JugglesChart workouts={workouts} />
          </div>
        </section>
      )}

      {/* Recent workouts */}
      {workouts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white text-base">Recent</h2>
            <Link href="/history" className="text-pitch-500 text-sm font-medium flex items-center gap-0.5">
              All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {workouts.slice(0, 4).map(w => (
              <WorkoutRow key={w.id} workout={w} isToday={w.date === today} />
            ))}
          </div>
        </section>
      )}

      {workouts.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-600">
          <p className="text-4xl mb-3">🌱</p>
          <p className="font-semibold">No workouts yet</p>
          <p className="text-sm mt-1">Log your first session above</p>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="font-bold text-white text-base mb-3">{title}</h2>;
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-gray-400 text-xs uppercase tracking-wide font-semibold">{label}</span>
      </div>
      <div className="text-xl font-black text-white tabular-nums">{value}</div>
      <div className="text-gray-500 text-xs mt-0.5">{sub}</div>
    </div>
  );
}

function WorkoutRow({ workout, isToday }: { workout: Workout; isToday: boolean }) {
  const done = EXERCISES.filter(ex => workout[ex.key as keyof Workout]).length;
  const dateLabel = isToday
    ? 'Today'
    : format(new Date(workout.date + 'T00:00:00'), 'EEE, MMM d');

  return (
    <div className="flex items-center bg-gray-900 rounded-xl px-4 py-3 border border-gray-800 gap-3">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isToday ? 'text-pitch-400' : 'text-white'}`}>{dateLabel}</p>
        <p className="text-gray-500 text-xs mt-0.5">{done}/{EXERCISES.length} exercises</p>
      </div>
      <div className="text-pitch-500 font-bold tabular-nums text-sm">
        {workout.juggles.toLocaleString()}
        <span className="text-gray-500 font-normal ml-1 text-xs">juggles</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-28 bg-gray-900 rounded-2xl animate-pulse border border-gray-800" />;
}
