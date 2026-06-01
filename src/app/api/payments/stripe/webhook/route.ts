import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleWebhook } from '@/lib/stripe';

// POST /api/payments/stripe/webhook - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const result = await handleWebhook(body, signature);

    if (!result.valid || !result.event) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const event = result.event;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        const metadata = session?.metadata || {};
        const userId = metadata.userId;
        const subscriptionId = metadata.subscriptionId;
        const transactionId = metadata.transactionId;

        if (subscriptionId) {
          // Update subscription status to active
          await db.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'active' },
          });
        }

        if (transactionId) {
          // Update transaction status to completed
          await db.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'completed',
              paidAt: new Date(),
              stripeChargeId: session?.payment_intent || session?.id,
            },
          });
        }

        // Create invoice
        if (userId && subscriptionId) {
          const amount = session?.amount_total ? session.amount_total / 100 : 0;
          await db.invoice.create({
            data: {
              userId,
              subscriptionId,
              amount,
              currency: session?.currency?.toUpperCase() || 'USD',
              status: 'paid',
              issuedAt: new Date(),
              paidAt: new Date(),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subData = event.data?.object;
        const stripeSubId = subData?.id;

        if (stripeSubId) {
          await db.subscription.updateMany({
            where: { stripeSubId: stripeSubId as string },
            data: { status: 'cancelled' },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoiceData = event.data?.object;
        const stripeInvoiceId = invoiceData?.id;
        const stripeSubId = invoiceData?.subscription;

        if (stripeSubId) {
          const sub = await db.subscription.findFirst({
            where: { stripeSubId: stripeSubId as string },
          });

          if (sub) {
            await db.invoice.create({
              data: {
                userId: sub.userId,
                subscriptionId: sub.id,
                amount: invoiceData?.amount_paid ? invoiceData.amount_paid / 100 : 0,
                currency: invoiceData?.currency?.toUpperCase() || 'USD',
                status: 'paid',
                stripeInvoiceId: stripeInvoiceId as string,
                issuedAt: new Date(),
                paidAt: new Date(),
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('POST /api/payments/stripe/webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
