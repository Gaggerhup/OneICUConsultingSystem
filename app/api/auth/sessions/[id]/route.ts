import { NextResponse } from 'next/server';
import { revokeProviderSession } from '@/lib/server-sessions';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await revokeProviderSession(id);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Unable to revoke session' },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[sessions:revoke]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revoke session' },
      { status: 500 },
    );
  }
}
