import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { hotelName, city, country, category, descriptionShort, descriptionLong, starRating, discountPercent, amenities, vibeTags } = body;

    if (!hotelName || !city || !country) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const slug = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6);

    const hotel = await db.hotel.create({
      data: {
        name: hotelName,
        slug,
        city,
        country,
        category: category || 'Hotel',
        descriptionShort: descriptionShort || '',
        descriptionLong: descriptionLong || '',
        starRating: starRating || 3,
        discountPercent: discountPercent || 15,
        amenities: JSON.stringify(amenities || []),
        vibeTags: JSON.stringify(vibeTags || []),
        status: 'pending',
        partnershipStatus: 'LISTING_ONLY',
      },
    });

    await db.hotelOwner.create({
      data: { userId: session.userId, hotelId: hotel.id, kycStatus: 'pending' },
    });

    return NextResponse.json({ success: true, data: hotel }, { status: 201 });
  } catch (error) {
    console.error('Hotel apply error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit application' }, { status: 500 });
  }
}
