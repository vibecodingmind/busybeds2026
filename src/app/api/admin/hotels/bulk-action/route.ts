import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, hotelIds } = body as { action: 'activate' | 'deactivate' | 'delete'; hotelIds: string[] };

    if (!action || !hotelIds || !Array.isArray(hotelIds) || hotelIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and at least one hotel ID are required' },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (hotelIds.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Cannot process more than 500 hotels at once' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'activate':
        result = await db.hotel.updateMany({
          where: { id: { in: hotelIds } },
          data: { status: 'active' },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} hotel${result.count !== 1 ? 's' : ''} activated`,
          affected: result.count,
        });

      case 'deactivate':
        result = await db.hotel.updateMany({
          where: { id: { in: hotelIds } },
          data: { status: 'inactive' },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} hotel${result.count !== 1 ? 's' : ''} deactivated`,
          affected: result.count,
        });

      case 'delete':
        // Delete related records first for each hotel (cascading deletes not set in schema)
        for (const hotelId of hotelIds) {
          await db.couponBlackout.deleteMany({ where: { hotelId } });
          await db.favorite.deleteMany({ where: { hotelId } });
          await db.flashDeal.deleteMany({ where: { hotelId } });
          await db.stayRequest.deleteMany({ where: { hotelId } });
          await db.review.deleteMany({ where: { hotelId } });
          await db.coupon.deleteMany({ where: { hotelId } });
          await db.roomType.deleteMany({ where: { hotelId } });
          await db.hotelVote.deleteMany({ where: { hotelId } });
          await db.hotelOwner.deleteMany({ where: { hotelId } });
          await db.hotelManager.deleteMany({ where: { hotelId } });
        }
        result = await db.hotel.deleteMany({
          where: { id: { in: hotelIds } },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} hotel${result.count !== 1 ? 's' : ''} deleted`,
          affected: result.count,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: activate, deactivate, or delete' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bulk action failed:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk action failed' },
      { status: 500 }
    );
  }
}
