import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const BASE_URL = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

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
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });

    const body = await request.json();
    const { amount, currency = 'USD', description = 'BusyBeds Subscription', subscriptionId } = body;

    if (!amount || amount <= 0) return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });

    const accessToken = await getAccessToken();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const orderRes = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: currency, value: amount.toFixed(2) },
          description,
          custom_id: subscriptionId || '',
        }],
        application_context: {
          return_url: `${appUrl}/subscribe?paypal=success`,
          cancel_url: `${appUrl}/subscribe?paypal=cancelled`,
          brand_name: 'BusyBeds',
        },
      }),
    });

    const orderData = await orderRes.json();
    if (orderData.id) {
      const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
      return NextResponse.json({ success: true, data: { orderId: orderData.id, approveUrl: approveLink } });
    }

    return NextResponse.json({ success: false, error: 'Failed to create PayPal order' }, { status: 500 });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
