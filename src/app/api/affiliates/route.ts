import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    let referralCode = user.referralCode;
    if (!referralCode) {
      const code = 'REF-' + user.fullName.replace(/\s+/g, '').toUpperCase().slice(0, 4) + Math.floor(Math.random() * 100);
      await db.user.update({ where: { id: session.userId }, data: { referralCode: code } });
      referralCode = code;
    }

    const referrals = await db.referral.findMany({ where: { referrerId: session.userId } });
    const earnings = await db.referralEarning.findMany({ where: { referrerId: session.userId } });

    const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
    const confirmedEarnings = earnings.filter(e => e.status === 'available' || e.status === 'paid').reduce((s, e) => s + e.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        totalReferrals: referrals.length,
        pendingEarnings,
        confirmedEarnings,
        referrals,
        earnings,
      },
    });
  } catch (error) {
    console.error('Affiliates fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch affiliate data' }, { status: 500 });
  }
}
