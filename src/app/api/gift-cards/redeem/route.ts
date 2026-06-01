import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

const redeemSchema = z.object({
  code: z.string().min(1, 'Gift card code is required'),
});

// POST /api/gift-cards/redeem - Redeem a gift card
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = redeemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i: z.ZodIssue) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { code } = validation.data;

    // Find gift card by code
    const giftCard = await db.giftCard.findUnique({
      where: { code },
    });

    if (!giftCard) {
      return NextResponse.json(
        { success: false, error: 'Gift card not found' },
        { status: 404 }
      );
    }

    // Check if active
    if (!giftCard.isActive) {
      return NextResponse.json(
        { success: false, error: 'Gift card is no longer active' },
        { status: 400 }
      );
    }

    // Check if has balance
    if (giftCard.balance <= 0) {
      return NextResponse.json(
        { success: false, error: 'Gift card has no remaining balance' },
        { status: 400 }
      );
    }

    // Check if expired
    if (giftCard.expiresAt && new Date() > new Date(giftCard.expiresAt)) {
      await db.giftCard.update({
        where: { id: giftCard.id },
        data: { isActive: false },
      });
      return NextResponse.json(
        { success: false, error: 'Gift card has expired' },
        { status: 400 }
      );
    }

    // Apply balance to user's account - mark as redeemed
    const updatedGiftCard = await db.giftCard.update({
      where: { id: giftCard.id },
      data: {
        redeemedById: session.userId,
        redeemedAt: new Date(),
        isActive: false,
        balance: 0,
      },
    });

    // Create transaction for the redemption
    await db.transaction.create({
      data: {
        userId: session.userId,
        amount: giftCard.balance,
        currency: 'USD',
        status: 'completed',
        type: 'gift_card_redemption',
        description: `Gift card redeemed: ${code}`,
        paidAt: new Date(),
      },
    });

    // Create notification
    await createNotification({
      userId: session.userId,
      type: 'gift_card_redeemed',
      title: 'Gift Card Redeemed!',
      body: `You've successfully redeemed a gift card worth $${giftCard.balance.toFixed(2)}.`,
      link: '/dashboard/billing',
    });

    return NextResponse.json({
      success: true,
      data: updatedGiftCard,
      message: `Gift card redeemed successfully! $${giftCard.balance.toFixed(2)} has been applied to your account.`,
    });
  } catch (error) {
    console.error('POST /api/gift-cards/redeem error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem gift card' },
      { status: 500 }
    );
  }
}
