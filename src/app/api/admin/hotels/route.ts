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
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;
    if (tier) where.tier = tier;
    if (category) where.category = category;
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { city: { contains: search, mode: 'insensitive' } }, { country: { contains: search, mode: 'insensitive' } }];

    const hotels = await db.hotel.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
    });
    const total = await db.hotel.count({ where });

    // Keep images as raw string for the admin list — client parses if needed
    return NextResponse.json({ success: true, data: hotels, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch hotels' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, slug, city, country, category, region, tier, status, partnershipStatus, starRating, descriptionShort, descriptionLong, discountPercent, couponValidDays, phone, address, websiteUrl, coverImage } = body;

    if (!name || !city || !country) return NextResponse.json({ success: false, error: 'Name, city, and country are required' }, { status: 400 });

    // Generate slug from name if not provided
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Ensure slug uniqueness
    const existing = await db.hotel.findUnique({ where: { slug: generatedSlug } });
    if (existing) return NextResponse.json({ success: false, error: 'A hotel with this slug already exists' }, { status: 409 });

    const hotel = await db.hotel.create({
      data: {
        name,
        slug: generatedSlug,
        city,
        country,
        category: category || 'Hotel',
        region: region || '',
        tier: tier || 'standard',
        status: status || 'active',
        partnershipStatus: partnershipStatus || 'LISTING_ONLY',
        starRating: starRating || 3,
        descriptionShort: descriptionShort || '',
        descriptionLong: descriptionLong || '',
        discountPercent: discountPercent ?? 15,
        couponValidDays: couponValidDays ?? 30,
        phone: phone || null,
        address: address || null,
        websiteUrl: websiteUrl || null,
        coverImage: coverImage || null,
      },
    });

    return NextResponse.json({ success: true, data: hotel }, { status: 201 });
  } catch (error) {
    console.error('Failed to create hotel:', error);
    return NextResponse.json({ success: false, error: 'Failed to create hotel' }, { status: 500 });
  }
}
