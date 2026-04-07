import { NextRequest, NextResponse } from 'next/server';
import { getAllWorkouts, getWorkoutsInRange, upsertWorkout } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const start = searchParams.get('start');
  const end   = searchParams.get('end');

  try {
    const workouts = start && end
      ? getWorkoutsInRange(start, end)
      : getAllWorkouts();
    return NextResponse.json(workouts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, juggles, neymar, outsideInside, atws, plyometrics, splitLunges, pogos } = body;

    if (!date || typeof juggles !== 'number') {
      return NextResponse.json({ error: 'date and juggles are required' }, { status: 400 });
    }

    const workout = upsertWorkout({
      date,
      juggles,
      neymar:        Boolean(neymar),
      outsideInside: Boolean(outsideInside),
      atws:          Boolean(atws),
      plyometrics:   Boolean(plyometrics),
      splitLunges:   Boolean(splitLunges),
      pogos:         Boolean(pogos),
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
