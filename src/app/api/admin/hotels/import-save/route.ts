import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getPlaceDetails(placeId: string, apiKey: string) {
  const fields = 'name,formatted_address,formatted_phone_number,website,rating,geometry,photos,types,url';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK') {
    throw new Error(`Place Details API error: ${data.status}`);
  }

  return data.result;
}

async function getPhotoUrl(photoRef: string, apiKey: string): Promise<string | null> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status === 302) {
      return res.headers.get('location') || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { placeId } = body;

    if (!placeId) {
      return NextResponse.json({ success: false, error: 'placeId is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Google Places API key not configured' }, { status: 500 });
    }

    // Check if already imported
    const existing = await db.hotel.findFirst({ where: { googlePlaceId: placeId } });
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Hotel already imported',
        data: existing,
      }, { status: 409 });
    }

    // Fetch detailed info from Google Places
    const details = await getPlaceDetails(placeId, apiKey);

    // Try to get photos
    let coverImage: string | null = null;
    const imageUrls: string[] = [];

    if (details.photos && details.photos.length > 0) {
      for (let i = 0; i < Math.min(details.photos.length, 5); i++) {
        const photoUrl = await getPhotoUrl(details.photos[i].photo_reference, apiKey);
        if (photoUrl) {
          if (i === 0) coverImage = photoUrl;
          imageUrls.push(photoUrl);
        }
      }
    }

    // Parse address to extract city and country
    const addressParts = (details.formatted_address || '').split(',').map((s: string) => s.trim());
    const city = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : addressParts[0] || 'Unknown';
    const country = addressParts.length >= 1 ? addressParts[addressParts.length - 1] : 'Tanzania';

    // Generate unique slug
    const baseSlug = slugify(details.name || 'hotel');
    let slug = baseSlug;
    let counter = 1;
    while (await db.hotel.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const hotel = await db.hotel.create({
      data: {
        name: details.name || 'Unknown Hotel',
        slug,
        city,
        country,
        category: 'Hotel',
        descriptionShort: `Imported from Google Maps. ${details.formatted_address || ''}`,
        descriptionLong: `Hotel imported from Google Maps. Located at ${details.formatted_address || 'N/A'}.${details.website ? ` Website: ${details.website}` : ''}`,
        starRating: details.rating ? Math.round(details.rating) : 3,
        address: details.formatted_address || null,
        phone: details.formatted_phone_number || null,
        websiteUrl: details.website || null,
        geoLat: details.geometry?.location?.lat || null,
        geoLng: details.geometry?.location?.lng || null,
        coverImage,
        images: JSON.stringify(imageUrls),
        googlePlaceId: placeId,
        importSource: 'google_places',
        isPartner: false,
        partnershipStatus: 'LISTING_ONLY',
        importedAt: new Date(),
        status: 'active',
      },
    });

    return NextResponse.json({ success: true, data: hotel });
  } catch (error) {
    console.error('Hotel import save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to import hotel' }, { status: 500 });
  }
}
