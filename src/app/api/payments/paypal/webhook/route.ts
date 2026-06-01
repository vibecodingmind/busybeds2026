import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body?.event_type;

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const customId = body?.resource?.custom_id || '';
      const [subscriptionId, transactionId] = customId.split(':');

      if (subscriptionId) {
        await db.subscription.update({ where: { id: subscriptionId }, data: { status: 'active' } }).catch(() => {});
      }
      if (transactionId) {
        await db.transaction.update({ where: { id: transactionId }, data: { status: 'completed', paidAt: new Date() } }).catch(() => {});
      }
    }

    if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      const subId = body?.resource?.id;
      if (subId) {
        await db.subscription.updateMany({ where: { stripeSubId: subId }, data: { status: 'cancelled' } }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
