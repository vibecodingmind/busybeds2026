import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const user = await db.user.findUnique({ where: { id: params.id }, select: { id: true, email: true, fullName: true, role: true, phone: true, avatar: true, bio: true, location: true, emailVerified: true, isBanned: true, spamScore: true, isFlagged: true, referralCode: true, createdAt: true } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const subscriptions = await db.subscription.findMany({ where: { userId: params.id }, take: 5 });
    const coupons = await db.coupon.findMany({ where: { userId: params.id }, take: 10 });
    const transactions = await db.transaction.findMany({ where: { userId: params.id }, take: 10 });

    return NextResponse.json({ success: true, data: { ...user, subscriptions, coupons, transactions } });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 }); }
}
