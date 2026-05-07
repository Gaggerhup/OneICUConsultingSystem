import { NextResponse } from 'next/server';
import {
  listProviderSessions,
  touchCurrentProviderSession,
} from '@/lib/server-sessions';

export async function GET() {
  try {
    const sessions = await listProviderSessions();
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('[sessions:get]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load sessions' },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  try {
    const session = await touchCurrentProviderSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No active server session' },
        { status: 401 },
      );
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error('[sessions:heartbeat]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to refresh session heartbeat' },
      { status: 500 },
    );
  }
}
