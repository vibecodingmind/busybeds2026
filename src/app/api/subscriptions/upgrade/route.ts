import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

const upgradeSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  billingCycle: z.enum(['monthly', 'annual']),
});

// POST /api/subscriptions/upgrade - Upgrade user's subscription
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
    const validation = upgradeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i: z.ZodIssue) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { packageId, billingCycle } = validation.data;

    // Get the new package
    const newPackage = await db.subscriptionPackage.findUnique({
      where: { id: packageId },
    });

    if (!newPackage || !newPackage.isActive) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive subscription package' },
        { status: 400 }
      );
    }

    // Get current active subscription
    const currentSub = await db.subscription.findFirst({
      where: {
        userId: session.userId,
        status: 'active',
      },
      include: { package: true },
    });

    if (!currentSub) {
      return NextResponse.json(
        { success: false, error: 'No active subscription to upgrade', message: 'Please subscribe first' },
        { status: 404 }
      );
    }

    // Check if it's actually an upgrade (new price should be higher)
    if (newPackage.priceMonthly <= currentSub.package.priceMonthly) {
      return NextResponse.json(
        { success: false, error: 'Not an upgrade', message: 'New package should be higher tier than current package' },
        { status: 400 }
      );
    }

    // Cancel current subscription
    await db.subscription.update({
      where: { id: currentSub.id },
      data: { status: 'cancelled' },
    });

    // Calculate new price
    const amount = billingCycle === 'annual'
      ? (newPackage.priceAnnual ?? newPackage.priceMonthly * 12)
      : newPackage.priceMonthly;

    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === 'annual') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setDate(expiresAt.getDate() + newPackage.durationDays);
    }

    // Create new subscription
    const newSubscription = await db.subscription.create({
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
        subscriptionId: newSubscription.id,
        amount,
        currency: 'USD',
        status: 'completed',
        type: 'upgrade',
        description: `Upgraded from ${currentSub.package.name} to ${newPackage.name}`,
        paidAt: now,
      },
    });

    // Create notification
    await createNotification({
      userId: session.userId,
      type: 'subscription_upgraded',
      title: 'Subscription Upgraded!',
      body: `You've upgraded to the ${newPackage.name} plan. Enjoy your new benefits!`,
      link: '/dashboard/subscription',
    });

    return NextResponse.json({
      success: true,
      data: newSubscription,
      message: 'Subscription upgraded successfully',
    });
  } catch (error) {
    console.error('POST /api/subscriptions/upgrade error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
