import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseInt(searchParams.get('radius') || '50'); // km
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!lat && !lng) {
      return NextResponse.json({ success: false, error: 'lat and lng required' }, { status: 400 });
    }

    const hotels = await db.hotel.findMany({
      where: { status: 'active', geoLat: { not: null }, geoLng: { not: null } },
      take: 200, // Fetch more, then filter by distance
    });

    const nearby = hotels
      .map(hotel => ({
        ...hotel,
        distance: haversineDistance(lat, lng, hotel.geoLat!, hotel.geoLng!),
        amenities: typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities || [],
        vibeTags: typeof hotel.vibeTags === 'string' ? JSON.parse(hotel.vibeTags) : hotel.vibeTags || [],
        images: typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images || [],
        discountRules: typeof hotel.discountRules === 'string' ? JSON.parse(hotel.discountRules) : hotel.discountRules || [],
      }))
      .filter(h => h.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return NextResponse.json({ success: true, data: nearby });
  } catch (error) {
    console.error('Nearby hotels error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch nearby hotels' }, { status: 500 });
  }
}
