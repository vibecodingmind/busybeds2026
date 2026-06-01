import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { initiatePayment } from '@/lib/pesapal';

const pesapalSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('TZS'),
  description: z.string().min(1, 'Description is required'),
  phone: z.string().optional(),
});

// POST /api/payments/pesapal/initiate - Initiate Pesapal payment
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
    const validation = pesapalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i: z.ZodIssue) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { amount, currency, description, phone } = validation.data;

    const reference = `PSL-${session.userId}-${Date.now()}`;

    const result = await initiatePayment({
      amount,
      currency,
      description,
      email: session.email,
      phone,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/pesapal/callback`,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderTrackingId: result.orderTrackingId,
        redirectUrl: result.redirectUrl,
      },
    });
  } catch (error) {
    console.error('POST /api/payments/pesapal/initiate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
