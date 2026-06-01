interface PesapalPaymentParams {
  amount: number;
  currency: string;
  email: string;
  phone?: string;
  description: string;
  callbackUrl: string;
}

interface PesapalPaymentResult {
  orderTrackingId: string;
  redirectUrl: string;
}

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

export async function initiatePayment(
  params: PesapalPaymentParams
): Promise<PesapalPaymentResult> {
  if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
    console.log('💰 [DEV MODE] Pesapal payment skipped (no API keys)');
    console.log(`   Amount: ${params.amount} ${params.currency}`);
    console.log(`   Email: ${params.email}`);
    console.log(`   Description: ${params.description}`);
    return {
      orderTrackingId: `pesapal_test_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      redirectUrl: params.callbackUrl + '?status=success&ref=dev_mode',
    };
  }

  try {
    // Step 1: Get auth token
    const authResponse = await fetch(
      'https://pay.pesapal.com/v3/api/Auth/RequestToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          consumer_key: PESAPAL_CONSUMER_KEY,
          consumer_secret: PESAPAL_CONSUMER_SECRET,
        }),
      }
    );

    const authData = await authResponse.json();

    if (!authData.token) {
      throw new Error('Failed to get Pesapal auth token');
    }

    // Step 2: Submit order
    const orderResponse = await fetch(
      'https://pay.pesapal.com/v3/api/Transactions/SubmitOrder',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          id: `BB_${Date.now()}`,
          currency: params.currency,
          amount: params.amount,
          description: params.description,
          callback_url: params.callbackUrl,
          notification_id: '',
          billing_address: {
            email_address: params.email,
            phone_number: params.phone || '',
            country_code: 'TZ',
            first_name: '',
            last_name: '',
            line_1: '',
            line_2: '',
            city: '',
            state: '',
            postal_code: '',
            zip_code: '',
          },
        }),
      }
    );

    const orderData = await orderResponse.json();

    return {
      orderTrackingId: orderData.order_tracking_id,
      redirectUrl: orderData.redirect_url,
    };
  } catch (error) {
    console.error('❌ Pesapal payment initiation failed:', error);
    throw new Error('Failed to initiate Pesapal payment');
  }
}
