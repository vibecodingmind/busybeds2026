import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function getHotelByIdOrSlug(idOrSlug: string) {
  let hotel = await db.hotel.findUnique({ where: { slug: idOrSlug } });
  if (!hotel) hotel = await db.hotel.findUnique({ where: { id: idOrSlug } });
  return hotel;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const hotel = await getHotelByIdOrSlug(params.id);
    if (!hotel) return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });

    const [roomTypes, reviews] = await Promise.all([
      db.roomType.findMany({ where: { hotelId: hotel.id, isActive: true } }),
      db.review.findMany({
        where: { hotelId: hotel.id, isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return NextResponse.json({ success: true, data: { ...hotel, roomTypes, reviews, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length } });
  } catch (error) { console.error('Hotel GET error:', error); return NextResponse.json({ success: false, error: 'Failed to fetch hotel' }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    const hotel = await getHotelByIdOrSlug(params.id);
    if (!hotel) return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
    const isOwner = await db.hotelOwner.findFirst({ where: { userId: session.userId, hotelId: hotel.id } });
    if (session.role !== 'admin' && !isOwner) return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    const body = await request.json();
    const updateData: any = {};
    const allowed = ['name','city','country','category','descriptionShort','descriptionLong','starRating','discountPercent','tier','websiteUrl','coverImage','status','partnershipStatus','couponValidDays'];
    for (const f of allowed) if (body[f] !== undefined) updateData[f] = body[f];
    if (body.amenities) updateData.amenities = JSON.stringify(body.amenities);
    if (body.vibeTags) updateData.vibeTags = JSON.stringify(body.vibeTags);
    if (body.discountRules) updateData.discountRules = JSON.stringify(body.discountRules);
    if (body.images) updateData.images = JSON.stringify(body.images);
    if (body.geoLat !== undefined) updateData.geoLat = body.geoLat;
    if (body.geoLng !== undefined) updateData.geoLng = body.geoLng;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    const updated = await db.hotel.update({ where: { id: hotel.id }, data: updateData });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) { console.error('Hotel PUT error:', error); return NextResponse.json({ success: false, error: 'Failed to update hotel' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin required' }, { status: 403 });
    const hotel = await getHotelByIdOrSlug(params.id);
    if (!hotel) return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
    await db.hotel.delete({ where: { id: hotel.id } });
    return NextResponse.json({ success: true, message: 'Hotel deleted' });
  } catch (error) { console.error('Hotel DELETE error:', error); return NextResponse.json({ success: false, error: 'Failed to delete hotel' }, { status: 500 }); }
}
