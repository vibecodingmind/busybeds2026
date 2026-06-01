import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function downloadPhotoToServer(photoUrl: string, hotelSlug: string, index: number): Promise<string | null> {
  try {
    const res = await fetch(photoUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'BusyBeds/1.0' },
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const buffer = Buffer.from(await res.arrayBuffer());

    const filename = `${hotelSlug}-${index}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'hotels');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return `/uploads/hotels/${filename}`;
  } catch (error) {
    console.error(`Failed to download photo for ${hotelSlug}:`, error);
    return null;
  }
}

async function getPlaceDetails(placeId: string, apiKey: string) {
  const fields = 'name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,geometry,photos,types,url';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') {
    throw new Error(`Place Details API error: ${data.status} - ${data.error_message || ''}`);
  }
  return data.result;
}

function detectRegion(address: string, city: string, country: string): string {
  const REGIONS: Record<string, string[]> = {
    'East Africa': ['Tanzania', 'Kenya', 'Uganda', 'Rwanda', 'Burundi', 'Ethiopia', 'Zanzibar'],
    'West Africa': ['Ghana', 'Nigeria'],
    'Southern Africa': ['South Africa'],
  };

  for (const [region, countries] of Object.entries(REGIONS)) {
    if (countries.some(c => country.toLowerCase().includes(c.toLowerCase()))) {
      return region;
    }
  }
  return country || 'Unknown';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { hotels, defaultTier, defaultCategory, defaultRegion } = body as {
      hotels: Array<{
        placeId: string;
        name: string;
        address: string;
        phone?: string;
        website?: string;
        rating?: number;
        lat?: number;
        lng?: number;
        photos?: string[];
        tier?: string;
        category?: string;
      }>;
      defaultTier?: string;
      defaultCategory?: string;
      defaultRegion?: string;
    };

    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
      return NextResponse.json({ success: false, error: 'No hotels provided' }, { status: 400 });
    }

    if (hotels.length > 60) {
      return NextResponse.json({ success: false, error: 'Maximum 60 hotels per bulk import' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Google Places API key not configured' }, { status: 500 });
    }

    const results: Array<{ name: string; status: string; error?: string }> = [];
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const hotelData of hotels) {
      try {
        // Check if already imported
        const existing = await db.hotel.findFirst({ where: { googlePlaceId: hotelData.placeId } });
        if (existing) {
          results.push({ name: hotelData.name, status: 'skipped', error: 'Already imported' });
          skipped++;
          continue;
        }

        // Fetch detailed info from Google Places
        let details: any = null;
        try {
          details = await getPlaceDetails(hotelData.placeId, apiKey);
        } catch (err) {
          console.error(`Failed to fetch details for ${hotelData.name}:`, err);
        }

        const name = details?.name || hotelData.name;
        const baseSlug = slugify(name);
        let slug = baseSlug;
        let counter = 1;
        while (await db.hotel.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Parse address to extract city and country
        const fullAddress = details?.formatted_address || hotelData.address || '';
        const addressParts = fullAddress.split(',').map((s: string) => s.trim());
        const city = addressParts.length >= 2 ? addressParts[addressParts.length - 2] : addressParts[0] || 'Unknown';
        const country = addressParts.length >= 1 ? addressParts[addressParts.length - 1] : 'Unknown';
        const region = defaultRegion || detectRegion(fullAddress, city, country);

        const tier = hotelData.tier || defaultTier || 'standard';
        const category = defaultCategory || 'Hotel';

        // Download photos to server
        const photoRefs = details?.photos || [];
        const downloadedPhotos: string[] = [];
        let coverImage: string | null = null;

        if (photoRefs.length > 0) {
          for (let i = 0; i < Math.min(photoRefs.length, 5); i++) {
            const photoRef = photoRefs[i].photo_reference;
            const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`;
            const localUrl = await downloadPhotoToServer(googlePhotoUrl, slug, i);
            if (localUrl) {
              if (i === 0) coverImage = localUrl;
              downloadedPhotos.push(localUrl);
            }
          }
        }

        // If no photos downloaded from details, try using the search result photos
        if (downloadedPhotos.length === 0 && hotelData.photos && hotelData.photos.length > 0) {
          for (let i = 0; i < Math.min(hotelData.photos.length, 5); i++) {
            const localUrl = await downloadPhotoToServer(hotelData.photos[i], slug, i);
            if (localUrl) {
              if (i === 0) coverImage = localUrl;
              downloadedPhotos.push(localUrl);
            }
          }
        }

        const phone = details?.formatted_phone_number || details?.international_phone_number || hotelData.phone || null;
        const website = details?.website || hotelData.website || null;
        const rating = details?.rating || hotelData.rating;
        const lat = details?.geometry?.location?.lat || hotelData.lat || null;
        const lng = details?.geometry?.location?.lng || hotelData.lng || null;

        // Create hotel
        await db.hotel.create({
          data: {
            name,
            slug,
            city,
            country,
            category,
            region,
            descriptionShort: `Imported from Google Maps. ${fullAddress}`,
            descriptionLong: `${name} is located at ${fullAddress}.${rating ? ` Rated ${rating}/5 stars on Google.${details?.user_ratings_total ? ` (${details.user_ratings_total} reviews)` : ''}` : ''}${phone ? ` Contact: ${phone}` : ''}${website ? ` Website: ${website}` : ''}`,
            starRating: rating ? Math.round(rating) : 3,
            address: fullAddress || null,
            phone,
            websiteUrl: website,
            geoLat: lat,
            geoLng: lng,
            coverImage,
            images: JSON.stringify(downloadedPhotos),
            googlePlaceId: hotelData.placeId,
            importSource: 'google_places',
            isPartner: false,
            partnershipStatus: 'LISTING_ONLY',
            importedAt: new Date(),
            tier,
            status: 'active',
            discountPercent: 15,
            couponValidDays: 30,
          },
        });

        results.push({ name, status: 'imported' });
        imported++;
      } catch (error) {
        console.error(`Failed to import ${hotelData.name}:`, error);
        results.push({ name: hotelData.name, status: 'failed', error: String(error) });
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: { total: hotels.length, imported, skipped, failed },
      results,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ success: false, error: 'Bulk import failed' }, { status: 500 });
  }
}
