import { NextResponse } from 'next/server';
import { getAllRegistrationsAdmin } from '@/lib/db';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const eventId = searchParams.get('eventId') || 'all';
    const checkedIn = searchParams.get('checkedIn') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    const rawRegistrations = getAllRegistrationsAdmin({
      search,
      eventId,
      checkedIn,
      sortBy,
      sortOrder,
    });

    // Role-based data sanitization:
    // CHECKIN_STAFF can only view basic attendee information (name, registrationId, eventTitle, checkedIn, checkedInAt, organization)
    // ADMIN can view full records including phone, email, and qrToken
    const isStaff = auth.session.role === 'CHECKIN_STAFF';

    const registrations = rawRegistrations.map((reg) => {
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

    return NextResponse.json({
      success: true,
      count: registrations.length,
      userRole: auth.session.role,
      data: registrations,
    });
  } catch (error) {
    console.error('API /api/admin/registrations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve registrations.' },
      { status: 500 }
    );
  }
}
