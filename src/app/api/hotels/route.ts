import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const createHotelSchema = z.object({
  name: z.string().min(1, 'Hotel name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  category: z.string().default('Hotel'),
  descriptionShort: z.string().min(1, 'Short description is required'),
  descriptionLong: z.string().min(1, 'Long description is required'),
  starRating: z.number().int().min(1).max(5).default(3),
  discountPercent: z.number().int().min(1).max(100).default(15),
  tier: z.enum(['standard', 'premium', 'luxury']).default('standard'),
  amenities: z.array(z.string()).optional(),
  vibeTags: z.array(z.string()).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  coverImage: z.string().optional(),
  couponValidDays: z.number().int().min(1).default(30),
});

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `${base}-${random}`;
}

// GET /api/hotels - List hotels with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const city = searchParams.get('city') || undefined;
    const country = searchParams.get('country') || undefined;
    const category = searchParams.get('category') || undefined;
    const tier = searchParams.get('tier') || undefined;
    const starRating = searchParams.get('starRating') ? parseInt(searchParams.get('starRating')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: 'active' };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
      ];
    }
    if (city) where.city = { contains: city };
    if (country) where.country = { contains: country };
    if (category) where.category = category;
    if (tier) where.tier = tier;
    if (starRating) where.starRating = starRating;

    const orderBy: Record<string, string> = { [sort]: order };

    const [hotels, total] = await Promise.all([
      db.hotel.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      db.hotel.count({ where }),
    ]);

    // Parse JSON string fields for client consumption
    const parsedHotels = hotels.map((hotel: Record<string, unknown>) => ({
      ...hotel,
      amenities: typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities || [],
      vibeTags: typeof hotel.vibeTags === 'string' ? JSON.parse(hotel.vibeTags) : hotel.vibeTags || [],
      images: typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images || [],
      discountRules: typeof hotel.discountRules === 'string' ? JSON.parse(hotel.discountRules) : hotel.discountRules || [],
    }));

    return NextResponse.json({
      success: true,
      data: parsedHotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/hotels error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}

// POST /api/hotels - Create hotel (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (session.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createHotelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const data = validation.data;
    const slug = generateSlug(data.name);

    const hotel = await db.hotel.create({
      data: {
        name: data.name,
        slug,
        city: data.city,
        country: data.country,
        category: data.category,
        descriptionShort: data.descriptionShort,
        descriptionLong: data.descriptionLong,
        starRating: data.starRating,
        discountPercent: data.discountPercent,
        tier: data.tier,
        amenities: JSON.stringify(data.amenities || []),
        vibeTags: JSON.stringify(data.vibeTags || []),
        websiteUrl: data.websiteUrl || null,
        coverImage: data.coverImage || null,
        couponValidDays: data.couponValidDays,
      },
    });

    return NextResponse.json({
      success: true,
      data: hotel,
      message: 'Hotel created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/hotels error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create hotel' },
      { status: 500 }
    );
  }
}
