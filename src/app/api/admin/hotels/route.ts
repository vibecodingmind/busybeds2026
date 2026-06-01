import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (tier) where.tier = tier;
    if (search) where.OR = [{ name: { contains: search } }, { city: { contains: search } }];

    const hotels = await db.hotel.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
    });
    const total = await db.hotel.count({ where });

    // Parse JSON string fields for client consumption
    const parsedHotels = hotels.map((hotel: Record<string, unknown>) => ({
      ...hotel,
      amenities: typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities as string) : hotel.amenities || [],
      vibeTags: typeof hotel.vibeTags === 'string' ? JSON.parse(hotel.vibeTags as string) : hotel.vibeTags || [],
      images: typeof hotel.images === 'string' ? JSON.parse(hotel.images as string) : hotel.images || [],
      discountRules: typeof hotel.discountRules === 'string' ? JSON.parse(hotel.discountRules as string) : hotel.discountRules || [],
    }));

    return NextResponse.json({ success: true, data: parsedHotels, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch hotels' }, { status: 500 }); }
}
