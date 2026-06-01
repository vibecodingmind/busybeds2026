import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const BASE_URL = PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, userId, subscriptionId, amount, currency = 'USD' } = await request.json();
    if (!orderId) return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });

    const accessToken = await getAccessToken();
    const captureRes = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });

    const captureData = await captureRes.json();

    if (captureData.status === 'COMPLETED') {
      if (subscriptionId && userId) {
        await db.subscription.update({ where: { id: subscriptionId }, data: { status: 'active' } });
        await db.transaction.create({
          data: {
            userId,
            subscriptionId,
            amount: amount || 0,
            currency,
            status: 'completed',
            type: 'subscription',
            description: 'PayPal subscription payment',
            paidAt: new Date(),
          },
        });
        await db.invoice.create({
          data: { userId, subscriptionId, amount: amount || 0, currency, status: 'paid', issuedAt: new Date(), paidAt: new Date() },
        });
      }
      return NextResponse.json({ success: true, data: captureData });
    }

    return NextResponse.json({ success: false, error: 'Payment not completed', data: captureData }, { status: 400 });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
