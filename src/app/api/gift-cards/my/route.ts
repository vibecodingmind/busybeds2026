import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/gift-cards/my - Get user's purchased and received gift cards
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get gift cards purchased by user
    const purchased = await db.giftCard.findMany({
      where: { purchasedById: session.userId },
      orderBy: { purchasedAt: 'desc' },
    });

    // Get gift cards redeemed by user
    const received = await db.giftCard.findMany({
      where: { redeemedById: session.userId },
      orderBy: { redeemedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        purchased,
        received,
      },
    });
  } catch (error) {
    console.error('GET /api/gift-cards/my error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gift cards' },
      { status: 500 }
    );
  }
}
