import { NextResponse } from 'next/server';
import { deleteRegistrationAdmin, getRegistrationById } from '@/lib/db';
import { deleteRegistrationFromKv } from '@/lib/kv';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request, { params }) {
  // CRITICAL REQUIREMENT: CHECKIN_STAFF must NOT be able to delete registrations.
  // Enforce ADMIN role only on the backend.
  const auth = await authorizeRequest(['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error || 'Access forbidden: Only ADMIN can delete registrations.',
      },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;

    // Delete permanently from Redis KV
    await deleteRegistrationFromKv(id);

    // Also remove from in-memory / local store
    deleteRegistrationAdmin(id);

    return NextResponse.json({
      success: true,
      message: `Registration ${id} deleted successfully by ${auth.session.username}.`,
    });
  } catch (error) {
    console.error('API /api/admin/registrations/[id] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while deleting registration.' },
      { status: 500 }
    );
  }
}
