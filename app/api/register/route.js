import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createRegistration, getRegistrationById, getAllEvents, syncFromRemoteKv } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, organization, eventId, consent } = body;

    // 1. Validation on backend
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid guest full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid contact phone or WhatsApp number.' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, error: 'You must confirm your attendance consent to complete registration.' },
        { status: 400 }
      );
    }

    // Determine target eventId (if none or "all", default to the main inaugural or first event)
    let selectedEventId = eventId;
    if (!selectedEventId || selectedEventId === 'all') {
      selectedEventId = 'gb-pass-cultural';
    }

    // 2. Create registration in database (handles unique constraint)
    let registration;
    try {
      registration = createRegistration({
        eventId: selectedEventId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organization: organization ? organization.trim() : null,
      });
    } catch (dbErr) {
      if (dbErr.code === 'DUPLICATE_REGISTRATION' || (dbErr.message && dbErr.message.includes('UNIQUE constraint'))) {
        return NextResponse.json(
          {
            success: false,
            error: 'This email address is already registered for this celebration session. Check your inbox or registration ID.',
          },
          { status: 409 }
        );
      }
      throw dbErr;
    }

    // 3. Generate QR code associated with that token
    // The QR code must NOT contain sensitive personal information (only public regId and cryptographically random token)
    const qrPayload = JSON.stringify({
      v: 1,
      regId: registration.registrationId,
      token: registration.qrToken,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#050505',
        light: '#F4E7C5',
      },
    });

    // 4. Return registration confirmation (omitting raw tokens and internal keys)
    return NextResponse.json(
      {
        success: true,
        message: 'Registration Successful',
        data: {
          registrationId: registration.registrationId,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          organization: registration.organization,
          eventTitle: registration.eventTitle || 'Goynar Baksho Annual Celebration 2026',
          eventDate: registration.eventDate || '2026-11-01',
          startTime: registration.startTime || '13:00',
          endTime: registration.endTime || '18:30',
          eventVenue: registration.eventVenue || "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
          eventCategory: registration.eventCategory || 'Celebration Gala',
          qrCodeDataUrl,
          createdAt: registration.createdAt,
        },
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('API /api/register error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while processing your registration. Please try again.',
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Registration ID required.' },
        { status: 400 }
      );
    }

    // Sync from remote KV if configured
    await syncFromRemoteKv();

    const registration = getRegistrationById(id);
    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration record not found.' },
        { status: 404 }
      );
    }

    // Re-generate QR code data URL for display/download
    const qrPayload = JSON.stringify({
      v: 1,
      regId: registration.registrationId,
      token: registration.qrToken,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: {
        dark: '#050505',
        light: '#F4E7C5',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        registrationId: registration.registrationId,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        organization: registration.organization,
        eventTitle: registration.eventTitle || 'Goynar Baksho Annual Celebration 2026',
        eventDate: registration.eventDate || '2026-11-01',
        startTime: registration.startTime || '13:00',
        endTime: registration.endTime || '18:30',
        eventVenue: registration.eventVenue || "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
        eventCategory: registration.eventCategory || 'Celebration Gala',
        checkedIn: Boolean(registration.checkedIn),
        checkedInAt: registration.checkedInAt || null,
        checkedInBy: registration.checkedInBy || null,
        qrCodeDataUrl,
        createdAt: registration.createdAt,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('API /api/register GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve registration.' },
      { status: 500 }
    );
  }
}
