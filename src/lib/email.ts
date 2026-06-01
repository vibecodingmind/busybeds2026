import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'BusyBeds <noreply@busybeds.com>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
    } else {
      console.log(`[EMAIL MOCK] To: ${params.to}, Subject: ${params.subject}`);
    }
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export function generateCouponEmail(
  couponCode: string,
  hotelName: string,
  discountPercent: number,
  expiresAt: Date,
  qrDataUrl?: string,
  guestName?: string
): { subject: string; html: string } {
  const greeting = guestName ? `Dear ${guestName}` : 'Hello';
  const subject = `Your ${discountPercent}% Discount Coupon for ${hotelName} - BusyBeds`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">BusyBeds</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Hotel Discount Coupon</p>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
        <p>${greeting},</p>
        <p>Your discount coupon for <strong>${hotelName}</strong> is ready!</p>
        <div style="background: white; border: 2px dashed #f97316; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Coupon Code</p>
          <p style="margin: 4px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #f97316;">${couponCode}</p>
          <p style="margin: 8px 0 0; font-size: 18px; color: #ea580c;"><strong>${discountPercent}% OFF</strong></p>
        </div>
        ${qrDataUrl ? `<div style="text-align: center; margin: 20px 0;"><img src="${qrDataUrl}" alt="QR Code" style="width: 150px; height: 150px;" /></div>` : ''}
        <p style="color: #6b7280;">Expires: ${new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="color: #9ca3af; font-size: 13px;">Present this coupon at check-in or use the code when booking online.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} BusyBeds. All rights reserved.</p>
      </div>
    </div>
  `;

  return { subject, html };
}
