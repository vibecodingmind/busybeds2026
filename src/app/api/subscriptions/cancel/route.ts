import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

// POST /api/subscriptions/cancel - Cancel user's active subscription
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.userId,
        status: 'active',
      },
      include: { package: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription to cancel' },
        { status: 404 }
      );
    }

    // Set status to 'cancelled'
    await db.subscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelled' },
    });

    // Create notification
    await createNotification({
      userId: session.userId,
      type: 'subscription_cancelled',
      title: 'Subscription Cancelled',
      body: `Your ${subscription.package.name} subscription has been cancelled. You can still use it until ${new Date(subscription.expiresAt).toLocaleDateString()}.`,
      link: '/dashboard/subscription',
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('POST /api/subscriptions/cancel error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
