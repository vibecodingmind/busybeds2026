import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { hotelId, rating, title, body: reviewBody } = body;

    if (!hotelId || !rating || !title || !reviewBody) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be 1-5' }, { status: 400 });
    }

    const hasCoupon = await db.coupon.findFirst({
      where: { userId: session.userId, hotelId, status: 'redeemed' },
    });
    if (!hasCoupon) {
      return NextResponse.json({ success: false, error: 'You can only review hotels where you have redeemed a coupon' }, { status: 403 });
    }

    const review = await db.review.create({
      data: { hotelId, userId: session.userId, rating, title, body: reviewBody, isVerified: true },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create review' }, { status: 500 });
  }
}
