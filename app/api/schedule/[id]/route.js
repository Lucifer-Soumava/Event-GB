import { NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/db';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const event = getEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('API /api/schedule/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  // Backend role enforcement: only ADMIN can modify schedule events
  const auth = await authorizeRequest(['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateEvent(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Event not found or could not be updated.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule event updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('API /api/schedule/[id] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule event.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  // Backend role enforcement: only ADMIN can delete schedule events
  const auth = await authorizeRequest(['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const { id } = await params;
    const deleted = deleteEvent(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Event not found or already removed.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule event deleted successfully.',
    });
  } catch (error) {
    console.error('API /api/schedule/[id] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule event.' },
      { status: 500 }
    );
  }
}
