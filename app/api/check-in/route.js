import { NextResponse } from 'next/server';
import { checkInAttendee, undoCheckInAttendee, syncFromRemoteKv } from '@/lib/db';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  // 1. Validate authentication (ADMIN or CHECKIN_STAFF allowed)
  const auth = await authorizeRequest(['ADMIN', 'CHECKIN_STAFF']);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        status: 'UNAUTHORIZED',
        error: auth.error || 'Authentication required to perform check-in.',
      },
      { status: auth.status }
    );
  }

  try {
    await syncFromRemoteKv();
    const body = await request.json();
    let rawToken = body.token || body.qrToken || body.registrationId;
    const targetEventId = body.eventId || body.targetEventId;
    const isUndo = body.action === 'undo' || body.action === 'reset';

    // 2. Validate QR token presence
    if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
      return NextResponse.json(
        {
          success: false,
          status: 'INVALID_QR_CODE',
          error: 'QR token or ticket identifier is missing.',
        },
        { status: 400 }
      );
    }

    rawToken = rawToken.trim();

    // Check if the scanned input is a JSON string (e.g. { v: 1, regId: "...", token: "..." })
    let tokenToVerify = rawToken;
    try {
      if (rawToken.startsWith('{') && rawToken.endsWith('}')) {
        const parsed = JSON.parse(rawToken);
        if (parsed.token) {
          tokenToVerify = parsed.token;
        } else if (parsed.regId) {
          tokenToVerify = parsed.regId;
        }
      }
    } catch {
      // Keep rawToken as is
    }

    // Handle Undo Check-in
    if (isUndo) {
      const undoResult = undoCheckInAttendee(tokenToVerify);
      if (!undoResult.success) {
        return NextResponse.json(
          {
            success: false,
            status: 'NOT_FOUND',
            message: undoResult.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        status: 'CHECKIN_RESET',
        message: undoResult.message,
        registration: undoResult.registration,
      });
    }

    // 3, 4, 5, 6, 7, 8: Authoritative database check & update
    const result = checkInAttendee(tokenToVerify, {
      staffName: auth.session.name || auth.session.username,
      staffId: auth.session.userId,
      targetEventId,
    });

    // 9. Return appropriate response matching specifications:
    // - ENTRY CONFIRMED
    // - ALREADY CHECKED IN
    // - INVALID QR CODE
    if (!result.success) {
      if (result.status === 'NOT_FOUND' || result.status === 'WRONG_EVENT') {
        return NextResponse.json(
          {
            success: false,
            status: result.status === 'WRONG_EVENT' ? 'WRONG_EVENT' : 'INVALID_QR_CODE',
            message: result.message,
            registration: result.registration,
          },
          { status: 400 }
        );
      }

      if (result.status === 'ALREADY_CHECKED_IN') {
        return NextResponse.json(
          {
            success: false,
            status: 'ALREADY_CHECKED_IN',
            message: 'ALREADY CHECKED IN',
            registration: {
              name: result.registration.name,
              registrationId: result.registration.registrationId,
              eventTitle: result.registration.eventTitle,
              checkedInAt: result.registration.checkedInAt,
              checkedInBy: result.registration.checkedInBy,
            },
          },
          { status: 409 }
        );
      }
    }

    // Successful check-in: ENTRY CONFIRMED
    return NextResponse.json({
      success: true,
      status: 'ENTRY_CONFIRMED',
      message: 'ENTRY CONFIRMED',
      checkInTime: result.registration.checkedInAt,
      checkedInBy: result.registration.checkedInBy,
      registration: {
        name: result.registration.name,
        registrationId: result.registration.registrationId,
        eventTitle: result.registration.eventTitle,
        eventVenue: result.registration.eventVenue,
        checkedInAt: result.registration.checkedInAt,
      },
    });
  } catch (error) {
    console.error('API /api/check-in error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'SERVER_ERROR',
        error: 'Failed to process gate check-in due to a server error.',
      },
      { status: 500 }
    );
  }
}
