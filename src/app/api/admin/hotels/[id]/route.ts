import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, slug, city, country, category, region, tier, status, partnershipStatus, starRating, descriptionShort, descriptionLong, discountPercent, couponValidDays, phone, address, websiteUrl, coverImage } = body;

    // If slug is being changed, check uniqueness
    if (slug) {
      const existing = await db.hotel.findFirst({ where: { slug, NOT: { id } } });
      if (existing) return NextResponse.json({ success: false, error: 'A hotel with this slug already exists' }, { status: 409 });
    }

    const hotel = await db.hotel.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(category !== undefined && { category }),
        ...(region !== undefined && { region }),
        ...(tier !== undefined && { tier }),
        ...(status !== undefined && { status }),
        ...(partnershipStatus !== undefined && { partnershipStatus }),
        ...(starRating !== undefined && { starRating }),
        ...(descriptionShort !== undefined && { descriptionShort }),
        ...(descriptionLong !== undefined && { descriptionLong }),
        ...(discountPercent !== undefined && { discountPercent }),
        ...(couponValidDays !== undefined && { couponValidDays }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(coverImage !== undefined && { coverImage }),
      },
    });

    return NextResponse.json({ success: true, data: hotel });
  } catch (error) {
    console.error('Failed to update hotel:', error);
    return NextResponse.json({ success: false, error: 'Failed to update hotel' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // Check hotel exists
    const hotel = await db.hotel.findUnique({ where: { id } });
    if (!hotel) return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });

    // Delete related records first (cascading deletes not set in schema)
    await db.couponBlackout.deleteMany({ where: { hotelId: id } });
    await db.favorite.deleteMany({ where: { hotelId: id } });
    await db.flashDeal.deleteMany({ where: { hotelId: id } });
    await db.stayRequest.deleteMany({ where: { hotelId: id } });
    await db.review.deleteMany({ where: { hotelId: id } });
    await db.coupon.deleteMany({ where: { hotelId: id } });
    await db.roomType.deleteMany({ where: { hotelId: id } });
    await db.hotelVote.deleteMany({ where: { hotelId: id } });
    await db.hotelOwner.deleteMany({ where: { hotelId: id } });
    await db.hotelManager.deleteMany({ where: { hotelId: id } });

    await db.hotel.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Hotel deleted' });
  } catch (error) {
    console.error('Failed to delete hotel:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete hotel' }, { status: 500 });
  }
}
