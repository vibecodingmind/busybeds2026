import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });

    const { id } = await params;
    // Try to find by slug first (since 'id' param can be a slug from the frontend), then by id
    const hotel = await db.hotel.findFirst({
      where: { OR: [{ slug: id }, { id }] }
    });
    if (!hotel) return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const message = body.message || '';

    // Create suggestion
    await db.hotelSuggestion.create({
      data: {
        userId: session.userId,
        hotelName: hotel.name,
        city: hotel.city,
        country: hotel.country,
        message,
        status: 'pending',
      },
    });

    // Notify admins
    const admins = await db.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'hotel_recommendation',
        title: 'Partner Recommendation',
        body: `${session.email} recommended ${hotel.name} for the BusyBeds Partner Program`,
        link: '/admin/hotels',
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: 'Recommendation submitted!' });
  } catch (error) {
    console.error('Recommend error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit recommendation' }, { status: 500 });
  }
}
