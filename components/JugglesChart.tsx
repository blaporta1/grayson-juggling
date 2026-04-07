'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { Workout } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface Props {
  workouts: Workout[];
}

interface TooltipPayload {
  value: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-pitch-500 font-bold text-lg">{payload[0].value} <span className="text-sm font-normal text-gray-300">juggles</span></p>
    </div>
  );
}

export default function JugglesChart({ workouts }: Props) {
  const data = useMemo(() => {
    return [...workouts]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30) // last 30 entries
      .map(w => ({
        date: format(parseISO(w.date), 'MMM d'),
        juggles: w.juggles,
      }));
  }, [workouts]);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        Log at least 2 workouts to see your trend
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="jugglesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151' }} />
        <Area
          type="monotone"
          dataKey="juggles"
          stroke="#22c55e"
          strokeWidth={2.5}
          fill="url(#jugglesGrad)"
          dot={false}
          activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
