import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/payments/pesapal/callback - Handle Pesapal callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderMerchantReference = searchParams.get('OrderMerchantReference');
    const status = searchParams.get('Status') || 'completed';

    if (orderTrackingId) {
      // Find and update the transaction with this Pesapal reference
      const transaction = await db.transaction.findFirst({
        where: { pesapalRef: orderTrackingId },
      });

      if (transaction) {
        const isSuccessful = status === 'completed' || status === 'COMPLETED';

        await db.transaction.update({
          where: { id: transaction.id },
          data: {
            status: isSuccessful ? 'completed' : 'failed',
            paidAt: isSuccessful ? new Date() : null,
          },
        });

        // If successful and there's a subscription, activate it
        if (isSuccessful && transaction.subscriptionId) {
          await db.subscription.update({
            where: { id: transaction.subscriptionId },
            data: { status: 'active' },
          });

          // Create invoice
          await db.invoice.create({
            data: {
              userId: transaction.userId,
              subscriptionId: transaction.subscriptionId,
              amount: transaction.amount,
              currency: transaction.currency,
              status: 'paid',
              issuedAt: new Date(),
              paidAt: new Date(),
            },
          });
        }
      }
    }

    // Redirect to success/cancel page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const isSuccess = status === 'completed' || status === 'COMPLETED';
    const redirectUrl = isSuccess
      ? `${appUrl}/dashboard/subscription?success=true`
      : `${appUrl}/dashboard/subscription?payment=failed`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('GET /api/payments/pesapal/callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/dashboard/subscription?payment=error`);
  }
}
