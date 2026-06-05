import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const REWARDS: Record<string, { points: number; description: string }> = {
  '1_week_basic': { points: 500, description: '1 free week on Basic plan' },
  '1_month_basic': { points: 1500, description: '1 free month on Basic plan' },
  '1_month_starter': { points: 2000, description: '1 free month on Starter plan' },
  '1_month_pro': { points: 5000, description: '1 free month on Pro plan' },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { rewardType } = body;
    const reward = REWARDS[rewardType];
    if (!reward) return NextResponse.json({ success: false, error: 'Invalid reward type' }, { status: 400 });

    const loyalty = await db.loyaltyPoints.findUnique({ where: { userId: session.userId } });
    if (!loyalty || loyalty.points < reward.points) {
      return NextResponse.json({ success: false, error: 'Insufficient points' }, { status: 400 });
    }

    await db.loyaltyPoints.update({
      where: { userId: session.userId },
      data: { points: loyalty.points - reward.points },
    });

    await db.pointTransaction.create({
      data: { userId: session.userId, points: -reward.points, type: 'redemption_spent', description: reward.description },
    });

    return NextResponse.json({ success: true, message: `Redeemed: ${reward.description}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to redeem points' }, { status: 500 });
  }
}
