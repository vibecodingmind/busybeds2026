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

    const { placeId, tier = 'standard', partnershipStatus = 'LISTING_ONLY', discountPercent = 0, city, country } = await request.json();
    if (!placeId) return NextResponse.json({ success: false, error: 'placeId required' }, { status: 400 });

    // Check if already imported by googlePlaceId
    const existingByPlaceId = await db.hotel.findFirst({ where: { googlePlaceId: placeId } });
    if (existingByPlaceId) return NextResponse.json({ success: false, error: 'Hotel already imported from Google', data: existingByPlaceId }, { status: 409 });

    // Fetch details from Google
    const details = await getHotelDetails(placeId);
    if (!details) return NextResponse.json({ success: false, error: 'Place not found on Google' }, { status: 404 });

    const name = details.name;
    const slug = generateSlug(name);

    // Check slug uniqueness
    const existing = await db.hotel.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ success: false, error: 'Hotel with this name already exists', data: existing }, { status: 409 });

    const isPartner = partnershipStatus === 'ACTIVE';
    const finalDiscount = isPartner ? (discountPercent || 15) : 0;

    // Collect all photos
    const photos = details.photos || [];
    const coverImage = photos[0] || details.photoUrl || null;
    const imagesJson = JSON.stringify(photos.length > 0 ? photos : (details.photoUrl ? [details.photoUrl] : []));

    // Create hotel
    const hotel = await db.hotel.create({
      data: {
        name,
        slug,
        city: city || details.address?.split(',')[0]?.trim() || 'Unknown',
        country: country || details.address?.split(',').pop()?.trim() || 'Unknown',
        category: 'Hotel',
        descriptionShort: `Imported from Google Maps - ${name}`,
        descriptionLong: `${name} is located at ${details.address || 'N/A'}. ${details.rating ? `Rated ${details.rating}/5 stars on Google.` : ''} ${details.phone ? `Contact: ${details.phone}` : ''}`,
        starRating: details.rating ? Math.round(details.rating) : 3,
        amenities: '[]',
        vibeTags: '[]',
        discountRules: '[]',
        phone: details.phone || null,
        address: details.address || null,
        websiteUrl: details.website || null,
        coverImage,
        images: imagesJson,
        geoLat: details.lat || null,
        geoLng: details.lng || null,
        googlePlaceId: placeId,
        tier,
        status: 'active',
        partnershipStatus: isPartner ? 'ACTIVE' : 'LISTING_ONLY',
        discountPercent: finalDiscount,
        couponValidDays: 30,
      },
    });

    return NextResponse.json({ success: true, data: hotel }, { status: 201 });
  } catch (error) {
    console.error('Hotel import error:', error);
    return NextResponse.json({ success: false, error: 'Failed to import hotel' }, { status: 500 });
  }
}
