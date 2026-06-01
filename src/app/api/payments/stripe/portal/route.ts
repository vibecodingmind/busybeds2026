import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.userId,
      return_url: returnUrl,
    });

    return NextResponse.json({ success: true, url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
