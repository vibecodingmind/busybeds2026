import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}

interface NotifyUserParams extends CreateNotificationParams {
  email?: { to: string; subject: string; html: string };
  sms?: { to: string; message: string };
  push?: { title: string; body: string; url?: string };
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: CreateNotificationParams): Promise<void> {
  await db.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      link,
    },
  });
}

export async function notifyUser({
  userId,
  type,
  title,
  body,
  link,
  email,
  sms,
  push,
}: NotifyUserParams): Promise<void> {
  // Always create in-app notification
  await createNotification({ userId, type, title, body, link });

  // Get user notification preferences
  const prefs = await db.notificationPreference.findUnique({
    where: { userId },
  });

  // Send email if provided and user allows
  if (email) {
    const shouldSendEmail =
      !prefs ||
      (type === 'coupon' && prefs.emailCoupons) ||
      (type === 'expiry' && prefs.emailExpiry) ||
      (type === 'flash_deal' && prefs.emailFlashDeals) ||
      (type === 'message' && prefs.emailMessages) ||
      !['coupon', 'expiry', 'flash_deal', 'message'].includes(type);

    if (shouldSendEmail) {
      await sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
      }).catch((err) => console.error('Failed to send notification email:', err));
    }
  }

  // Send SMS if provided and user allows
  if (sms) {
    const shouldSendSMS =
      !prefs ||
      (type === 'coupon' && prefs.smsCoupons) ||
      (type === 'expiry' && prefs.smsExpiry) ||
      !['coupon', 'expiry'].includes(type);

    if (shouldSendSMS) {
      await sendSMS({ to: sms.to, message: sms.message }).catch((err) =>
        console.error('Failed to send notification SMS:', err)
      );
    }
  }

  // Push notification stub — in production this would use web push
  if (push) {
    if (!prefs || prefs.pushAll) {
      try {
        const pushSub = await db.pushSubscription.findUnique({
          where: { userId },
        });
        if (pushSub) {
          console.log(`🔔 [PUSH] To: ${userId}, Title: ${push.title}, Body: ${push.body}`);
          // In production: use web-push library with pushSub details
        }
      } catch (err) {
        console.error('Failed to send push notification:', err);
      }
    }
  }
}
