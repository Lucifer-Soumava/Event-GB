import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { kv, getRegistrationsFromKv } from '@/lib/kv';
import { generateRegistrationId, generateQrToken, getStore } from '@/lib/db';
import { getPassCategoryById } from '@/lib/passes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST: Save a new registration permanently
export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, organization, eventId, consent } = data;

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

    if (!consent && consent !== undefined) {
      return NextResponse.json(
        { success: false, error: 'You must confirm your attendance consent to complete registration.' },
        { status: 400 }
      );
    }

    let selectedEventId = eventId;
    if (!selectedEventId || selectedEventId === 'all') {
      selectedEventId = 'gb-pass-cultural';
    }

    const targetEmail = (email || '').trim().toLowerCase();

    // Check duplicate in Redis
    const existingList = await getRegistrationsFromKv();
    const isDuplicate = existingList.some(
      (r) =>
        (r.email || '').trim().toLowerCase() === targetEmail &&
        (r.eventId === selectedEventId || (!r.eventId && selectedEventId === 'gb-pass-cultural'))
    );

    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'This email address is already registered for this celebration session. Check your inbox or registration ID.',
        },
        { status: 409 }
      );
    }

    const registrationId = data.registrationId || generateRegistrationId();
    const qrToken = data.qrToken || generateQrToken();
    const now = new Date().toISOString();

    // Generate QR Code associated with token
    const qrPayload = JSON.stringify({
      v: 1,
      regId: registrationId,
      token: qrToken,
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

    // Pushes to the start of the "registrations" list (never expires)
    const entry = {
      id: data.id || Date.now(),
      registrationId,
      eventId: selectedEventId,
      name: (name || '').trim(),
      email: targetEmail,
      phone: (phone || '').trim(),
      organization: organization ? organization.trim() : null,
      qrToken,
      qrCodeDataUrl,
      checkedIn: 0,
      checkedInAt: null,
      checkedInBy: null,
      createdAt: now,
      ...data,
      // Canonical keys
      registrationId,
      qrToken,
      qrCodeDataUrl,
      email: targetEmail,
      name: (name || '').trim(),
    };

    // Pushes to the start of the "registrations" list (never expires)
    await kv.lpush('goynar_baksho_registrations', JSON.stringify(entry));

    // Dual-save to persistent Redis hash map for zero-data-loss resiliency
    try {
      await kv.hset('goynar_baksho_registrations_hash', {
        [registrationId]: JSON.stringify(entry),
      });
    } catch (_) {}

    // Also update in-memory store so any synchronous reads immediately have it
    try {
      const store = getStore();
      if (store && Array.isArray(store.registrations)) {
        store.registrations.unshift(entry);
      }
    } catch (_) {}

    const pass = getPassCategoryById(selectedEventId);
    const enriched = {
      ...entry,
      eventTitle: pass ? pass.title : 'Goynar Baksho Annual Celebration 2026',
      eventDate: '2026-11-01',
      startTime: pass ? pass.startTime : '13:00',
      endTime: pass ? pass.endTime : '18:30',
      eventVenue: pass ? pass.venue : "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006",
      eventCategory: pass ? pass.category : 'Celebration Gala',
    };

    return NextResponse.json(
      {
        success: true,
        entry: enriched,
        data: enriched,
        message: 'Registration Successful',
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
    console.error('API /api/register POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while processing your registration. Please try again.',
      },
      { status: 500 }
    );
  }
}

// GET: Fetch all registrations for the admin page OR single registration by ?id=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Fetch all items through central resilient reader
    const registrations = await getRegistrationsFromKv();

    // If a specific ID is requested (e.g. from confirmation page /register/confirmation?id=...)
    if (id) {
      let registration = registrations.find(
        (r) => r.registrationId === id || String(r.id) === String(id)
      );

      // Resilient fallback: Check persistent hash map if not in list
      if (!registration) {
        try {
          const direct = await kv.hget('goynar_baksho_registrations_hash', id);
          if (direct) {
            registration = typeof direct === 'string' ? JSON.parse(direct) : direct;
          }
        } catch (_) {}
      }

      if (!registration) {
        return NextResponse.json(
          { success: false, error: 'Registration record not found.' },
          { status: 404 }
        );
      }

      let qrCodeDataUrl = registration.qrCodeDataUrl;
      if (!qrCodeDataUrl && registration.qrToken) {
        const qrPayload = JSON.stringify({
          v: 1,
          regId: registration.registrationId,
          token: registration.qrToken,
        });
        qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 280,
          color: { dark: '#050505', light: '#F4E7C5' },
        });
      }

      const pass = getPassCategoryById(registration.eventId);
      return NextResponse.json(
        {
          success: true,
          data: {
            ...registration,
            eventTitle: registration.eventTitle || (pass ? pass.title : 'Goynar Baksho Annual Celebration 2026'),
            eventDate: registration.eventDate || '2026-11-01',
            startTime: registration.startTime || (pass ? pass.startTime : '13:00'),
            endTime: registration.endTime || (pass ? pass.endTime : '18:30'),
            eventVenue: registration.eventVenue || (pass ? pass.venue : "Boys' Own Library Auditorium, Hatibagan, Kolkata 700006"),
            eventCategory: registration.eventCategory || (pass ? pass.category : 'Celebration Gala'),
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
        }
      );
    }

    // Default: return all registrations for the admin page
    return Response.json(registrations);
  } catch (error) {
    console.error('API /api/register GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve registrations.' },
      { status: 500 }
    );
  }
}
