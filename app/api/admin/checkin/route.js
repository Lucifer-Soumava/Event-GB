import { NextResponse } from 'next/server';
import { checkInAttendee } from '@/lib/db';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // Allow ADMIN and CHECKIN_STAFF
  const auth = await authorizeRequest(['ADMIN', 'CHECKIN_STAFF']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    let token = body.token?.trim() || body.registrationId?.trim() || body.qrToken?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'A QR token or registration ID is required for check-in.' },
        { status: 400 }
      );
    }

    // Parse JSON QR payload if present
    if (token.startsWith('{') && token.endsWith('}')) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.token) token = parsed.token;
        else if (parsed.regId) token = parsed.regId;
      } catch {
        // continue
      }
    }

    const result = checkInAttendee(token, {
      staffName: auth.session.name || auth.session.username,
      staffId: auth.session.userId,
      targetEventId: body.eventId,
    });

    if (!result.success) {
      const statusCode = result.status === 'NOT_FOUND' ? 404 : 409;
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          message: result.message,
          registration: result.registration,
        },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      message: result.message,
      checkedInBy: auth.session.name,
      registration: result.registration,
    });
  } catch (error) {
    console.error('API /api/admin/checkin error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process check-in.' },
      { status: 500 }
    );
  }
}
