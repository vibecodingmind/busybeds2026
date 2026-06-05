import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple in-memory rate limiter
const redeemAttempts = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = redeemAttempts.get(ip);
  if (!entry || now - entry.lastReset > WINDOW_MS) {
    redeemAttempts.set(ip, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ success: false, error: 'Too many attempts. Please wait.' }, { status: 429 });
    }

    const body = await request.json();
    const { code } = body;
    if (!code) return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });

    const coupon = await db.coupon.findUnique({
      where: { code },
      include: { hotel: { select: { name: true, city: true } } },
    });

    if (!coupon) return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });

    if (coupon.status === 'redeemed') {
      return NextResponse.json({ success: false, error: 'Coupon already redeemed' }, { status: 400 });
    }

    if (coupon.status === 'expired' || new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'Coupon has expired' }, { status: 400 });
    }

    if (coupon.status === 'cancelled') {
      return NextResponse.json({ success: false, error: 'Coupon has been cancelled' }, { status: 400 });
    }

    // Redeem
    const updated = await db.coupon.update({
      where: { code },
      data: { status: 'redeemed', redeemedAt: new Date() },
      include: { hotel: { select: { name: true, city: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        code: updated.code,
        status: updated.status,
        discountPercent: updated.discountPercent,
        guestName: updated.guestName,
        hotelName: updated.hotel.name,
        hotelCity: updated.hotel.city,
        redeemedAt: updated.redeemedAt,
      },
    });
  } catch (error) {
    console.error('Redeem coupon error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
