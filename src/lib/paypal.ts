const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

function getBaseUrl() {
  return PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export async function createOrder(params: {
  amount: number;
  currency: string;
  description: string;
  customId?: string;
}): Promise<{ orderId: string; approveUrl: string }> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    // Dev mode - return mock
    return {
      orderId: `MOCK_${Date.now()}`,
      approveUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscription?paypal_success=true`,
    };
  }

  const accessToken = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: params.currency, value: params.amount.toFixed(2) },
        description: params.description,
        custom_id: params.customId || '',
      }],
    }),
  });

  const data = await res.json();
  const approveUrl = data.links?.find((l: any) => l.rel === 'approve')?.href || '';

  return { orderId: data.id, approveUrl };
}

export async function captureOrder(orderId: string): Promise<{ captured: boolean; amount: number }> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return { captured: true, amount: 0 };
  }

  const accessToken = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await res.json();
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    captured: capture?.status === 'COMPLETED',
    amount: parseFloat(capture?.amount?.value || '0'),
  };
}
