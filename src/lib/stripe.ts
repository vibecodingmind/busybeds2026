import Stripe from 'stripe';

// Lazy-initialized Stripe client to avoid build errors when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-05-27.dahlia',
    });
  }
  return _stripe;
}

// Proxy that lazily initializes Stripe on first property access
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const instance = getStripe();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});

export async function createCheckoutSession({
  priceId,
  amount,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  priceId?: string;
  amount?: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  if (priceId) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return { sessionId: session.id, url: session.url };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: metadata.description || 'BusyBeds Subscription' },
        unit_amount: (amount || 0) * 100,
      },
      quantity: 1,
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
  return { sessionId: session.id, url: session.url };
}

export async function handleWebhook(payload: string, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
    return { valid: true, event };
  } catch {
    return { valid: false, event: null };
  }
}
