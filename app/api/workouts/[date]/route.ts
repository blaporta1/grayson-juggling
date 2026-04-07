import { NextRequest, NextResponse } from 'next/server';
import { getWorkoutByDate } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { date } = await params;
    const workout = getWorkoutByDate(date);
    if (!workout) {
      return NextResponse.json({ workout: null });
    }
    return NextResponse.json(workout);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
  }
}
