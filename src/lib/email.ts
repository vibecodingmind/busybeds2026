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

export function generateVerifyEmail(
  fullName: string,
  verifyToken: string
): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
  const subject = 'Verify Your Email - BusyBeds';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0E5C3B, #0a4a2f); padding: 30px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">BusyBeds</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Email Verification</p>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #0E5C3B; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Or copy this link to your browser: <br/><a href="${verifyUrl}" style="color: #0E5C3B; word-break: break-all;">${verifyUrl}</a></p>
        <p style="color: #9ca3af; font-size: 13px;">This link expires in 24 hours.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} BusyBeds. All rights reserved.</p>
      </div>
    </div>
  `;

  return { subject, html };
}

export function generateResetPasswordEmail(
  fullName: string,
  resetToken: string
): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const subject = 'Reset Your Password - BusyBeds';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0E5C3B, #0a4a2f); padding: 30px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px;">BusyBeds</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Password Reset</p>
      </div>
      <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
        <p>Hello <strong>${fullName}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #0E5C3B; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Or copy this link to your browser: <br/><a href="${resetUrl}" style="color: #0E5C3B; word-break: break-all;">${resetUrl}</a></p>
        <p style="color: #9ca3af; font-size: 13px;">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
      </div>
      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} BusyBeds. All rights reserved.</p>
      </div>
    </div>
  `;

  return { subject, html };
}
