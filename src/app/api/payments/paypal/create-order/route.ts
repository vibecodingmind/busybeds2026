import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createOrder } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });

    const { amount, currency = 'USD', description, subscriptionId, transactionId } = await request.json();
    if (!amount || !description) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });

    const result = await createOrder({
      amount,
      currency,
      description,
      customId: `${subscriptionId || ''}:${transactionId || ''}`,
    });

    return NextResponse.json({ success: true, orderId: result.orderId, approveUrl: result.approveUrl });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
