import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';

const checkoutSchema = z.object({
  priceId: z.string().optional(),
  successUrl: z.string().min(1, 'Success URL is required'),
  cancelUrl: z.string().min(1, 'Cancel URL is required'),
});

// POST /api/payments/stripe/create-checkout - Create Stripe checkout session
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
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i: z.ZodIssue) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { priceId, successUrl, cancelUrl } = validation.data;

    const checkoutResult = await createCheckoutSession({
      priceId,
      amount: 0, // Will use priceId if provided, otherwise amount
      successUrl,
      cancelUrl,
      metadata: {
        userId: session.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutResult.sessionId,
        url: checkoutResult.url,
      },
    });
  } catch (error) {
    console.error('POST /api/payments/stripe/create-checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
