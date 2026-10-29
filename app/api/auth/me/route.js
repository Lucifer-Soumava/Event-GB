import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession();

  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };

  if (!session) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401, headers }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        userId: session.userId,
        username: session.username,
        name: session.name,
        role: session.role,
      },
    },
    { headers }
  );
}
