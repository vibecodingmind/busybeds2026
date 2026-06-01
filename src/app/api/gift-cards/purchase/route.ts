import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);

const purchaseGiftCardSchema = z.object({
  amount: z.number().positive('Amount must be positive').min(5, 'Minimum amount is $5').max(500, 'Maximum amount is $500'),
  recipientEmail: z.string().email('Valid recipient email is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  message: z.string().optional(),
});

// POST /api/gift-cards/purchase - Purchase a gift card
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
    const validation = purchaseGiftCardSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i: z.ZodIssue) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { amount, recipientEmail, recipientName, message } = validation.data;

    // Generate unique gift card code
    const code = `GC-${nanoid(4)}-${nanoid(4)}`;

    // Calculate expiry (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Create GiftCard in DB
    const giftCard = await db.giftCard.create({
      data: {
        code,
        amount,
        balance: amount,
        purchasedById: session.userId,
        recipientEmail,
        recipientName,
        message: message || null,
        isActive: true,
        expiresAt,
      },
    });

    // Create Transaction record
    await db.transaction.create({
      data: {
        userId: session.userId,
        amount,
        currency: 'USD',
        status: 'completed',
        type: 'gift_card_purchase',
        description: `Gift card purchased for ${recipientName} (${recipientEmail})`,
        paidAt: new Date(),
      },
    });

    // Send gift card email to recipient (non-blocking)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; border-radius: 12px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">BusyBeds Gift Card</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">A special gift for you!</p>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <p>Dear ${recipientName},</p>
          <p>You've received a BusyBeds gift card!</p>
          ${message ? `<p style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316; font-style: italic;">"${message}"</p>` : ''}
          <div style="background: white; border: 2px dashed #f97316; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Gift Card Code</p>
            <p style="margin: 4px 0; font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #f97316;">${code}</p>
            <p style="margin: 8px 0 0; font-size: 24px; color: #ea580c;"><strong>$${amount.toFixed(2)}</strong></p>
          </div>
          <p style="color: #6b7280;">Valid until: ${expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="color: #9ca3af; font-size: 13px;">Use this code at checkout or in your BusyBeds account to redeem.</p>
        </div>
      </div>
    `;

    sendEmail({
      to: recipientEmail,
      subject: `You've received a $${amount.toFixed(2)} BusyBeds Gift Card!`,
      html: emailHtml,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      data: giftCard,
      message: 'Gift card purchased successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/gift-cards/purchase error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to purchase gift card' },
      { status: 500 }
    );
  }
}
