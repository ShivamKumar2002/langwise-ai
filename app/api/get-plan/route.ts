import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { getPlanByUserId } from '@/lib/utils-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    initializeDatabase();

    const plan = getPlanByUserId(userId);

    if (!plan) {
      return NextResponse.json(
        { error: 'No plan found for this user' },
        { status: 404 }
      );
    }

    console.log('[v0] Retrieved plan for user:', userId);

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('[v0] Get plan error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve plan' },
      { status: 500 }
    );
  }
}
