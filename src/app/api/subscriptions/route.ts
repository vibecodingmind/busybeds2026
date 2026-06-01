import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
import { initiatePayment } from '@/lib/pesapal';
import { createNotification } from '@/lib/notifications';

const subscribeSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  billingCycle: z.enum(['monthly', 'annual']),
  paymentMethod: z.enum(['stripe', 'pesapal']),
});

// POST /api/subscriptions - Create or get active subscription
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
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i: z.ZodIssue) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { packageId, billingCycle, paymentMethod } = validation.data;

    // Get package details
    const pkg = await db.subscriptionPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg || !pkg.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive subscription package' },
        { status: 400 }
      );
    }

    // Calculate price based on billing cycle
    const amount = billingCycle === 'annual'
      ? (pkg.priceAnnual ?? pkg.priceMonthly * 12)
      : pkg.priceMonthly;

    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === 'annual') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setDate(expiresAt.getDate() + pkg.durationDays);
    }

    // For Explorer (free) plan: just create subscription directly
    if (pkg.priceMonthly === 0 && billingCycle === 'monthly') {
      // Check if user already has an active subscription for this package
      const existingSub = await db.subscription.findFirst({
        where: {
          userId: session.userId,
          packageId,
          status: 'active',
          expiresAt: { gte: now },
        },
      });

      if (existingSub) {
        return NextResponse.json({
          success: true,
          data: existingSub,
          message: 'You already have an active subscription',
        });
      }

      // Cancel any existing active subscriptions
      await db.subscription.updateMany({
        where: { userId: session.userId, status: 'active' },
        data: { status: 'cancelled' },
      });

      // Create subscription directly
      const subscription = await db.subscription.create({
        data: {
          userId: session.userId,
          packageId,
          status: 'active',
          billingCycle,
          startsAt: now,
          expiresAt,
        },
        include: { package: true },
      });

      // Create transaction record
      await db.transaction.create({
        data: {
          userId: session.userId,
          subscriptionId: subscription.id,
          amount: 0,
          currency: 'USD',
          status: 'completed',
          type: 'subscription',
          description: `Free ${pkg.name} plan`,
          paidAt: now,
        },
      });

      // Create notification
      await createNotification({
        userId: session.userId,
        type: 'subscription_created',
        title: 'Subscription Activated!',
        body: `Your ${pkg.name} plan is now active. Enjoy your benefits!`,
        link: '/dashboard/subscription',
      });

      return NextResponse.json({
        success: true,
        data: subscription,
        message: 'Subscription activated successfully',
      });
    }

    // For paid plans, initiate payment
    // Cancel any existing active subscriptions first
    await db.subscription.updateMany({
      where: { userId: session.userId, status: 'active' },
      data: { status: 'cancelled' },
    });

    // Create pending subscription
    const subscription = await db.subscription.create({
      data: {
        userId: session.userId,
        packageId,
        status: 'pending',
        billingCycle,
        startsAt: now,
        expiresAt,
      },
      include: { package: true },
    });

    // Create pending transaction
    const transaction = await db.transaction.create({
      data: {
        userId: session.userId,
        subscriptionId: subscription.id,
        amount,
        currency: 'USD',
        status: 'pending',
        type: 'subscription',
        description: `${pkg.name} - ${billingCycle} plan`,
      },
    });

    if (paymentMethod === 'stripe') {
      // Create Stripe checkout session
      const checkoutResult = await createCheckoutSession({
        priceId: billingCycle === 'annual' ? pkg.stripePriceIdMonthly || undefined : pkg.stripePriceIdMonthly || undefined,
        amount,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscription?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscription?cancelled=true`,
        metadata: {
          userId: session.userId,
          subscriptionId: subscription.id,
          transactionId: transaction.id,
          packageId,
          billingCycle,
        },
      });

      // Update transaction with Stripe session ID
      await db.transaction.update({
        where: { id: transaction.id },
        data: { stripeInvoiceId: checkoutResult.sessionId },
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: checkoutResult.url,
        data: subscription,
        message: 'Redirect to Stripe to complete payment',
      });
    }

    if (paymentMethod === 'pesapal') {
      // Initiate Pesapal payment
      const pesapalResult = await initiatePayment({
        amount,
        currency: 'TZS',
        description: `${pkg.name} - ${billingCycle} plan`,
        email: session.email,
        reference: `SUB-${subscription.id}`,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/pesapal/callback`,
      });

      // Update transaction with Pesapal reference
      await db.transaction.update({
        where: { id: transaction.id },
        data: { pesapalRef: pesapalResult.orderTrackingId },
      });

      return NextResponse.json({
        success: true,
        checkoutUrl: pesapalResult.redirectUrl,
        data: subscription,
        message: 'Redirect to Pesapal to complete payment',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid payment method' },
      { status: 400 }
    );
  } catch (error) {
    console.error('POST /api/subscriptions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
