import { NextResponse } from 'next/server';
import { kv, enrichRegistrationWithEvent } from '@/lib/kv';
import { getAllEvents, getStore } from '@/lib/db';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  // Allow ADMIN and CHECKIN_STAFF
  const auth = await authorizeRequest(['ADMIN', 'CHECKIN_STAFF']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    // Fetch all items from index 0 to -1 (the entire list) permanently from KV
    const rawList = await kv.lrange('goynar_baksho_registrations', 0, -1);
    const registrations = rawList.map((item) =>
      typeof item === 'string' ? JSON.parse(item) : item
    );

    // Sync in-memory store so helper methods stay consistent
    try {
      const store = getStore();
      if (store && Array.isArray(registrations)) {
        store.registrations = registrations;
      }
    } catch (_) {}

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const eventId = searchParams.get('eventId') || 'all';
    const checkedIn = searchParams.get('checkedIn') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const allEvents = getAllEvents();
    let list = registrations.map((r) => enrichRegistrationWithEvent(r, allEvents));

    if (search) {
      const term = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.name || '').toLowerCase().includes(term) ||
          (r.email || '').toLowerCase().includes(term) ||
          (r.phone || '').toLowerCase().includes(term) ||
          (r.registrationId || '').toLowerCase().includes(term) ||
          (r.organization || '').toLowerCase().includes(term)
      );
    }

    if (eventId && eventId !== 'all') {
      list = list.filter((r) => r.eventId === eventId);
    }

    if (checkedIn !== undefined && checkedIn !== 'all') {
      const isChecked =
        checkedIn === '1' || checkedIn === 1 || checkedIn === 'true';
      list = list.filter((r) => Boolean(r.checkedIn) === isChecked);
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
      if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
      return 0;
    });

    // Role-based data sanitization:
    const isStaff = auth.session.role === 'CHECKIN_STAFF';

    const sanitized = list.map((reg) => {
      if (isStaff) {
        return {
          registrationId: reg.registrationId,
          name: reg.name,
          organization: reg.organization,
          eventTitle: reg.eventTitle,
          eventCategory: reg.eventCategory,
          checkedIn: reg.checkedIn,
          checkedInAt: reg.checkedInAt,
          createdAt: reg.createdAt,
          // Mask private details for staff
          email: reg.email ? reg.email.replace(/(.{2})(.*)(?=@)/, (_m, a, b) => a + '*'.repeat(Math.max(b.length, 3))) : '',
          phone: reg.phone ? reg.phone.slice(0, 3) + '****' + reg.phone.slice(-3) : '',
        };
      }
      return reg;
    });

    return NextResponse.json(
      {
        success: true,
        count: sanitized.length,
        userRole: auth.session.role,
        data: sanitized,
        registrations: sanitized,
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
    console.error('API /api/admin/registrations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve registrations.' },
      { status: 500 }
    );
  }
}
