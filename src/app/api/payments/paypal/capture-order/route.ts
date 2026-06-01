import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { captureOrder } from '@/lib/paypal';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });

    const { orderId, subscriptionId, transactionId } = await request.json();
    if (!orderId) return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });

    const result = await captureOrder(orderId);

    if (result.captured) {
      if (subscriptionId) {
        await db.subscription.update({ where: { id: subscriptionId }, data: { status: 'active' } });
      }
      if (transactionId) {
        await db.transaction.update({ where: { id: transactionId }, data: { status: 'completed', paidAt: new Date() } });
      }
    }

    return NextResponse.json({ success: true, captured: result.captured });
  } catch (error) {
    console.error('PayPal capture order error:', error);
    return NextResponse.json({ success: false, error: 'Failed to capture order' }, { status: 500 });
  }
}
