import { NextResponse } from 'next/server';
import { getAdminAnalytics } from '@/lib/db';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const analytics = getAdminAnalytics();
    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('API /api/admin/analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute festival analytics.' },
      { status: 500 }
    );
  }
}
