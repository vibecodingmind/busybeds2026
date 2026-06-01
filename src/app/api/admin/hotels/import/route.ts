import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getHotelDetails } from '@/lib/googlePlaces';

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { placeId, tier = 'standard', partnershipStatus = 'LISTING_ONLY', city, country } = await request.json();
    if (!placeId) return NextResponse.json({ success: false, error: 'placeId required' }, { status: 400 });

    // Fetch details from Google
    const details = await getHotelDetails(placeId);
    if (!details) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 });

    const name = details.name;
    const slug = generateSlug(name);

    // Check slug uniqueness
    const existing = await db.hotel.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ success: false, error: 'Hotel with this name already exists' }, { status: 409 });

    // Create hotel
    const hotel = await db.hotel.create({
      data: {
        name,
        slug,
        city: city || details.address?.split(',')[0]?.trim() || 'Unknown',
        country: country || details.address?.split(',').pop()?.trim() || 'Unknown',
        category: 'Hotel',
        descriptionShort: `Imported from Google - ${name}`,
        descriptionLong: `${name} is located at ${details.address || 'N/A'}. ${details.rating ? `Rated ${details.rating}/5 stars.` : ''}`,
        starRating: details.rating ? Math.round(details.rating) : 3,
        amenities: '[]',
        vibeTags: '[]',
        discountRules: '[]',
        phone: details.phone || null,
        address: details.address || null,
        websiteUrl: details.website || null,
        coverImage: details.photoUrl || null,
        images: details.photoUrl ? JSON.stringify([details.photoUrl]) : '[]',
        geoLat: details.lat || null,
        geoLng: details.lng || null,
        tier,
        status: 'active',
        partnershipStatus,
        discountPercent: 15,
        couponValidDays: 30,
      },
    });

    return NextResponse.json({ success: true, data: hotel }, { status: 201 });
  } catch (error) {
    console.error('Hotel import error:', error);
    return NextResponse.json({ success: false, error: 'Failed to import hotel' }, { status: 500 });
  }
}
