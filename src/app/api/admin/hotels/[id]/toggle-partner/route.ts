import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isPartner, partnerDiscountPercent } = body;

    const hotel = await db.hotel.findUnique({ where: { id } });
    if (!hotel) {
      return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
    }

    const updateData: any = {
      isPartner: isPartner === true,
    };

    if (isPartner) {
      updateData.partnershipStatus = 'ACTIVE';
      updateData.partnerDiscountPercent = partnerDiscountPercent || hotel.discountPercent;
      updateData.discountPercent = partnerDiscountPercent || hotel.discountPercent;
    } else {
      updateData.partnershipStatus = 'LISTING_ONLY';
      updateData.partnerDiscountPercent = null;
    }

    const updated = await db.hotel.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Toggle partner error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update partner status' }, { status: 500 });
  }
}
