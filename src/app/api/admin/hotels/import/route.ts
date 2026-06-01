import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin required' }, { status: 403 })
    }

    const { query, city, country, tier = 'standard', maxResults = 20 } = await request.json()
    if (!query || !city) {
      return NextResponse.json({ success: false, error: 'Query and city required' }, { status: 400 })
    }

    // Search Google Places
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' in ' + city + ' ' + (country || ''))}&type=lodging&key=${PLACES_API_KEY}`
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      return NextResponse.json({ success: false, error: 'Google Places API error: ' + searchData.status }, { status: 500 })
    }

    const results = searchData.results?.slice(0, maxResults) || []
    const imported: any[] = []
    const skipped: any[] = []

    for (const place of results) {
      // Check if hotel already exists
      const existing = await db.hotel.findFirst({ where: { name: place.name, city } })
      if (existing) {
        skipped.push({ name: place.name, reason: 'Already exists' })
        continue
      }

      const slug = place.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)

      // Determine tier from star rating
      const starRating = place.rating ? Math.round(place.rating) : 3
      const hotelTier = tier || (starRating >= 5 ? 'luxury' : starRating >= 4 ? 'premium' : 'standard')

      const hotel = await db.hotel.create({
        data: {
          name: place.name,
          slug,
          city,
          country: country || 'Tanzania',
          category: place.types?.includes('lodging') ? 'Hotel' : 'Lodge',
          descriptionShort: `Located in ${city}. ${place.formatted_address || ''}`,
          descriptionLong: `${place.name} is located in ${city}${country ? ', ' + country : ''}. ${place.formatted_address || 'Contact for more details.'}`,
          starRating,
          discountPercent: 0,
          amenities: JSON.stringify([]),
          vibeTags: JSON.stringify([]),
          partnershipStatus: 'LISTING_ONLY',
          status: 'active',
          tier: hotelTier,
          coverImage: place.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${PLACES_API_KEY}`
            : null,
          images: JSON.stringify(place.photos?.slice(0, 5)?.map((p: any) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${PLACES_API_KEY}`
          ) || []),
          geoLat: place.geometry?.location?.lat,
          geoLng: place.geometry?.location?.lng,
          phone: place.formatted_phone_number || null,
          address: place.formatted_address || null,
          websiteUrl: place.website || null,
        },
      })

      // Create default rooms
      for (const [ri, rn] of ['Standard Room', 'Deluxe Room', 'Suite'].entries()) {
        await db.roomType.create({
          data: {
            hotelId: hotel.id,
            name: rn,
            bedType: ri === 2 ? 'King' : 'Queen',
            sizeSqm: 25 + ri * 10,
            pricePerNight: 70 + ri * 50,
            maxGuests: ri === 2 ? 4 : 2,
          },
        })
      }

      imported.push({ id: hotel.id, name: hotel.name, tier: hotelTier })
    }

    return NextResponse.json({
      success: true,
      data: { imported: imported.length, skipped: skipped.length, details: { imported, skipped } },
    })
  } catch (error) {
    console.error('Hotel import error:', error)
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 })
  }
}
