import { NextResponse } from 'next/server';
import { getAllEvents, getCategories, createEvent, reorderEvents } from '@/lib/db';
import { authorizeRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    const timeFrame = searchParams.get('timeFrame'); // 'today' | 'upcoming' | 'all'
    const orderBy = searchParams.get('orderBy') || 'displayOrder';
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    // If public request (not admin) and status is not specifically requested,
    // default to showing published / scheduled events, excluding 'unpublished' / 'draft'
    let effectiveStatus = status;
    if (!includeUnpublished && (!status || status === 'all')) {
      // By default public shows active events ('scheduled', 'published', 'live', 'completed')
      // but we filter out 'unpublished' or 'draft'
    }

    let events = getAllEvents({ category, status: effectiveStatus, date, search, orderBy });

    // Filter out unpublished for public requests if not explicitly including unpublished
    if (!includeUnpublished) {
      events = events.filter((e) => e.status !== 'unpublished' && e.status !== 'draft');
    }

    const categories = getCategories();

    // Today's date in IST (or ISO date)
    const today = new Date().toISOString().split('T')[0];

    // Filter by timeFrame if requested
    if (timeFrame === 'today') {
      events = events.filter((e) => e.date === today);
    } else if (timeFrame === 'upcoming') {
      events = events.filter((e) => e.date >= today);
    }

    return NextResponse.json(
      {
        success: true,
        count: events.length,
        categories: ['All', ...categories],
        data: events,
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
    console.error('API /api/schedule error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch event schedule from database.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // Backend role enforcement: only ADMIN can create schedule events
  const auth = await authorizeRequest(['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();

    // Validation
    const requiredFields = ['title', 'description', 'date', 'startTime', 'endTime', 'venue', 'category'];
    const missing = requiredFields.filter((f) => !body[f] || (typeof body[f] === 'string' && !body[f].trim()));

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missing.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const newEvent = createEvent(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Schedule event created successfully.',
        data: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API /api/schedule POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create schedule event.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  // Backend role enforcement: only ADMIN can reorder schedule events
  const auth = await authorizeRequest(['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'orderedIds must be a non-empty array of event IDs.' },
        { status: 400 }
      );
    }

    const updatedEvents = reorderEvents(orderedIds);

    return NextResponse.json({
      success: true,
      message: 'Schedule order updated successfully.',
      data: updatedEvents,
    });
  } catch (error) {
    console.error('API /api/schedule PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule order.' },
      { status: 500 }
    );
  }
}
