import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const updateHotelSchema = z.object({
  name: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  category: z.string().optional(),
  descriptionShort: z.string().min(1).optional(),
  descriptionLong: z.string().min(1).optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  tier: z.enum(['standard', 'premium', 'luxury']).optional(),
  amenities: z.array(z.string()).optional(),
  vibeTags: z.array(z.string()).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  coverImage: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  partnershipStatus: z.enum(['LISTING_ONLY', 'COUPON_PARTNER', 'FULL_PARTNER', 'ACTIVE']).optional(),
  couponValidDays: z.number().int().min(1).optional(),
});

// GET /api/hotels/[slug] - Get hotel by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const hotel = await db.hotel.findUnique({
      where: { slug },
      include: {
        roomTypes: { where: { isActive: true } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { fullName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    const reviews = hotel.reviews;
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...hotel,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    console.error('GET /api/hotels/[slug] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotel' },
      { status: 500 }
    );
  }
}

// PUT /api/hotels/[slug] - Update hotel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const hotel = await db.hotel.findUnique({ where: { slug } });

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const isOwner = await db.hotelOwner.findFirst({
      where: { userId: session.userId, hotelId: hotel.id },
    });
    if (session.role !== 'admin' && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to update this hotel' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateHotelSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const data = validation.data;

    if (data.name !== undefined) updateData.name = data.name;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.descriptionShort !== undefined) updateData.descriptionShort = data.descriptionShort;
    if (data.descriptionLong !== undefined) updateData.descriptionLong = data.descriptionLong;
    if (data.starRating !== undefined) updateData.starRating = data.starRating;
    if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
    if (data.tier !== undefined) updateData.tier = data.tier;
    if (data.amenities !== undefined) updateData.amenities = JSON.stringify(data.amenities);
    if (data.vibeTags !== undefined) updateData.vibeTags = JSON.stringify(data.vibeTags);
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl || null;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.partnershipStatus !== undefined) updateData.partnershipStatus = data.partnershipStatus;
    if (data.couponValidDays !== undefined) updateData.couponValidDays = data.couponValidDays;

    const updated = await db.hotel.update({
      where: { slug },
      data: updateData,
      include: { roomTypes: true },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Hotel updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/hotels/[slug] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update hotel' },
      { status: 500 }
    );
  }
}

// DELETE /api/hotels/[slug] - Delete hotel (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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

    const { slug } = await params;
    const hotel = await db.hotel.findUnique({ where: { slug } });

    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    await db.hotel.delete({ where: { slug } });

    return NextResponse.json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/hotels/[slug] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete hotel' },
      { status: 500 }
    );
  }
}
