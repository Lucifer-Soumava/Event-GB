import { NextResponse } from 'next/server';
import { getAdminAnalytics } from '@/lib/db';
import { kv } from '@/lib/kv';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Only ADMIN can view analytics
  const auth = await authorizeRequest(['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    // Read fresh registrations permanently from Redis
    const rawList = await kv.lrange('goynar_baksho_registrations', 0, -1);
    const registrations = rawList.map((item) =>
      typeof item === 'string' ? JSON.parse(item) : item
    );

    const analytics = getAdminAnalytics(registrations);
    return NextResponse.json(
      {
        success: true,
        data: analytics,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('API /api/admin/analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute festival analytics.' },
      { status: 500 }
    );
  }
}
