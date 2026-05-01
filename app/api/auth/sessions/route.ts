import { NextResponse } from 'next/server';
import {
  createProviderSession,
  listProviderSessions,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createProviderSession({
      profile: body.profile,
      userAgent: body.userAgent,
      platform: body.platform,
      isMock: Boolean(body.isMock),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[sessions:create]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 400 },
    );
  }
}
