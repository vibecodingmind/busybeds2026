import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const userId = session.userId;

    const [user, coupons, subscriptions, transactions, favorites, reviews, loyalty, badges, notifications, referrals, messages] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, fullName: true, phone: true, role: true, bio: true, location: true, language: true, timezone: true, displayCurrency: true, createdAt: true } }),
      db.coupon.findMany({ where: { userId }, include: { hotel: { select: { name: true, city: true } } } }),
      db.subscription.findMany({ where: { userId }, include: { package: { select: { name: true, priceMonthly: true } } } }),
      db.transaction.findMany({ where: { userId } }),
      db.favorite.findMany({ where: { userId }, include: { hotel: { select: { name: true, city: true } } } }),
      db.review.findMany({ where: { userId: userId } }),
      db.loyaltyPoints.findUnique({ where: { userId } }),
      db.badge.findMany({ where: { userId } }),
      db.notification.findMany({ where: { userId }, take: 100 }),
      db.referral.findMany({ where: { referrerId: userId } }),
      db.message.findMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] }, take: 100 }),
    ]);

    const exportData = { exportDate: new Date().toISOString(), user, coupons, subscriptions, transactions, favorites, reviews, loyalty, badges, notifications, referrals, messages };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const userId = session.userId;
    const { confirmEmail } = await request.json();
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });

    if (confirmEmail !== user?.email) {
      return NextResponse.json({ success: false, error: 'Email confirmation does not match' }, { status: 400 });
    }

    await Promise.all([
      db.coupon.deleteMany({ where: { userId } }),
      db.favorite.deleteMany({ where: { userId } }),
      db.review.deleteMany({ where: { userId } }),
      db.badge.deleteMany({ where: { userId } }),
      db.notification.deleteMany({ where: { userId } }),
      db.pointTransaction.deleteMany({ where: { userId } }),
      db.loyaltyPoints.deleteMany({ where: { userId } }),
      db.transaction.deleteMany({ where: { userId } }),
      db.subscription.deleteMany({ where: { userId } }),
      db.pushSubscription.deleteMany({ where: { userId } }),
      db.notificationPreference.deleteMany({ where: { userId } }),
      db.message.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
    ]);

    await db.user.delete({ where: { id: userId } });

    const response = NextResponse.json({ success: true, message: 'Account deleted' });
    response.cookies.set('busybeds-token', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete account' }, { status: 500 });
  }
}
