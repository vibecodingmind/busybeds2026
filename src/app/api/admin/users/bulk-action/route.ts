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
    const { action, userIds, reason } = body as {
      action: 'activate' | 'suspend' | 'ban' | 'delete';
      userIds: string[];
      reason?: string;
    };

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and at least one user ID are required' },
        { status: 400 }
      );
    }

    if (userIds.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Cannot process more than 500 users at once' },
        { status: 400 }
      );
    }

    // Prevent self-action
    if (userIds.includes(session.userId)) {
      return NextResponse.json(
        { success: false, error: 'You cannot perform bulk actions on your own account' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'activate':
        // Unsuspend and unban users
        result = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { isBanned: false, suspendedAt: null, suspendedReason: null },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} user${result.count !== 1 ? 's' : ''} activated`,
          affected: result.count,
        });

      case 'suspend':
        result = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            suspendedAt: new Date(),
            suspendedReason: reason || 'Bulk suspension by admin',
          },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} user${result.count !== 1 ? 's' : ''} suspended`,
          affected: result.count,
        });

      case 'ban':
        result = await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { isBanned: true },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} user${result.count !== 1 ? 's' : ''} banned`,
          affected: result.count,
        });

      case 'delete':
        // Delete related records first
        for (const userId of userIds) {
          await db.favorite.deleteMany({ where: { userId } });
          await db.review.deleteMany({ where: { userId } });
          await db.coupon.deleteMany({ where: { userId } });
          await db.stayRequest.deleteMany({ where: { userId } });
          await db.hotelVote.deleteMany({ where: { userId } });
          await db.pushSubscription.deleteMany({ where: { userId } });
          await db.hotelOwner.deleteMany({ where: { userId } });
          await db.hotelManager.deleteMany({ where: { userId } });
          await db.account.deleteMany({ where: { userId } });
          await db.session.deleteMany({ where: { userId } });
        }
        result = await db.user.deleteMany({
          where: { id: { in: userIds } },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} user${result.count !== 1 ? 's' : ''} deleted`,
          affected: result.count,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: activate, suspend, ban, or delete' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bulk user action failed:', error);
    return NextResponse.json({ success: false, error: 'Bulk action failed' }, { status: 500 });
  }
}
