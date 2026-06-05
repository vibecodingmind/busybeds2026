import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateCouponCode } from '@/lib/coupon';
import { isCouponExpired, isWithinDateRange } from '@/lib/coupon';
import { generateQRCode } from '@/lib/qr';
import { getEffectiveDiscount } from '@/lib/discountRules';
import { awardPoints } from '@/lib/loyalty';
import { checkAndAwardBadges } from '@/lib/badges';
import { convertUsdToTzs } from '@/lib/currency';
import { sendEmail, generateCouponEmail } from '@/lib/email';
import { createNotification } from '@/lib/notifications';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const createCouponSchema = z.object({
  hotelId: z.string().min(1, 'Hotel ID is required'),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional().or(z.literal('')),
});

// GET /api/coupons - Get user's coupons, paginated
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const hotelId = searchParams.get('hotelId') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.userId };
    if (status) where.status = status;
    if (hotelId) where.hotelId = hotelId;

    const [coupons, total] = await Promise.all([
      db.coupon.findMany({
        where,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
              coverImage: true,
              tier: true,
              starRating: true,
            },
          },
        },
        orderBy: { generatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.coupon.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/coupons error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create a new coupon (THE CORE COUPON GENERATION ENGINE)
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
    const validation = createCouponSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i: z.ZodIssue) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { hotelId, checkIn, checkOut, guestName, guestEmail } = validation.data;

    // 1. Check user has active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.userId,
        status: 'active',
        expiresAt: { gte: new Date() },
      },
      include: { package: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription', message: 'Please subscribe to generate coupons' },
        { status: 403 }
      );
    }

    const pkg = subscription.package;

    // 3. Count coupons generated this billing period
    const periodStart = new Date(subscription.startsAt);
    const couponsThisPeriod = await db.coupon.count({
      where: {
        userId: session.userId,
        subscriptionId: subscription.id,
        generatedAt: { gte: periodStart },
      },
    });

    // 4. Check coupon limit
    if (couponsThisPeriod >= pkg.couponLimitPerPeriod) {
      return NextResponse.json(
        { success: false, error: 'Limit reached', message: "You've used all your coupons this month" },
        { status: 403 }
      );
    }

    // 5. Get hotel details
    const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    if (hotel.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Hotel is not available' },
        { status: 400 }
      );
    }

    // 6. Check hotel tier access
    if (hotel.tier === 'premium' && !pkg.canBookPremium) {
      return NextResponse.json(
        { success: false, error: 'Upgrade required', message: 'Upgrade to access Premium hotels' },
        { status: 403 }
      );
    }

    if (hotel.tier === 'luxury' && !pkg.canBookLuxury) {
      return NextResponse.json(
        { success: false, error: 'Upgrade required', message: 'Upgrade to access Luxury hotels' },
        { status: 403 }
      );
    }

    // 8. Check for existing active coupon for same hotel by same user
    const existingCoupon = await db.coupon.findFirst({
      where: {
        userId: session.userId,
        hotelId,
        status: 'active',
        expiresAt: { gte: new Date() },
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            coverImage: true,
            tier: true,
            starRating: true,
          },
        },
      },
    });

    if (existingCoupon) {
      return NextResponse.json({
        success: true,
        data: existingCoupon,
        message: 'You already have an active coupon for this hotel',
      });
    }

    // 9. Check blackout dates
    const now = new Date();
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const blackouts = await db.couponBlackout.findMany({
        where: { hotelId },
      });

      for (const blackout of blackouts) {
        const blackoutStart = new Date(blackout.startDate);
        const blackoutEnd = new Date(blackout.endDate);

        if (
          (checkInDate >= blackoutStart && checkInDate <= blackoutEnd) ||
          (checkOutDate >= blackoutStart && checkOutDate <= blackoutEnd) ||
          (checkInDate <= blackoutStart && checkOutDate >= blackoutEnd)
        ) {
          return NextResponse.json(
            {
              success: false,
              error: 'Blackout dates',
              message: `Your dates overlap with a blackout period (${blackout.startDate} to ${blackout.endDate}${blackout.reason ? `: ${blackout.reason}` : ''}). Please choose different dates.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 10. Get effective discount
    const totalUserCoupons = await db.coupon.count({ where: { userId: session.userId } });
    const isNewUser = totalUserCoupons === 0;
    const { discountPercent, ruleName } = getEffectiveDiscount(
      Array.isArray(hotel.discountRules) ? hotel.discountRules : (typeof hotel.discountRules === 'string' ? JSON.parse(hotel.discountRules as string) : []),
      hotel.discountPercent,
      now,
      { isNewUser }
    );

    // 11. Generate unique coupon code
    const couponCode = generateCouponCode();

    // 12. Generate QR code
    const qrDataUrl = await generateQRCode(couponCode);

    // 13. Calculate expiry date
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + hotel.couponValidDays);

    // 14. Set start/end times if checkIn/checkOut provided
    const startTime = checkIn ? new Date(checkIn) : null;
    const endTime = checkOut ? new Date(checkOut) : null;

    // 15. Get cheapest room price for price snapshot
    const cheapestRoom = await db.roomType.findFirst({
      where: { hotelId, isActive: true },
      orderBy: { pricePerNight: 'asc' },
    });

    const priceUsd = cheapestRoom?.pricePerNight ?? null;
    const priceTzs = priceUsd ? convertUsdToTzs(priceUsd) : null;
    const exchangeRate = priceUsd ? 2600 : null;

    // 16. Create Coupon in DB
    const coupon = await db.coupon.create({
      data: {
        code: couponCode,
        qrDataUrl,
        userId: session.userId,
        hotelId,
        subscriptionId: subscription.id,
        discountPercent,
        discountRuleName: ruleName,
        guestName: guestName || null,
        status: 'active',
        generatedAt: now,
        expiresAt,
        startTime,
        endTime,
        priceUsd,
        priceTzs,
        exchangeRate,
      },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            coverImage: true,
            tier: true,
            starRating: true,
          },
        },
      },
    });

    // 17. Award loyalty points (non-blocking)
    awardPoints(session.userId, 10, 'Coupon generated').catch(console.error);

    // 18. Send coupon email (non-blocking)
    const recipientEmail = guestEmail || session.email;
    if (recipientEmail) {
      const emailContent = generateCouponEmail(
        couponCode,
        hotel.name,
        discountPercent,
        expiresAt,
        qrDataUrl || undefined,
        guestName || undefined
      );
      sendEmail({
        to: recipientEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      }).catch(console.error);
    }

    // 19. Create in-app notification
    await createNotification({
      userId: session.userId,
      type: 'coupon_generated',
      title: 'Coupon Generated!',
      body: `Your ${discountPercent}% discount coupon for ${hotel.name} is ready. Code: ${couponCode}`,
      link: '/dashboard/coupons',
    });

    // 20. Check and award badges (async, non-blocking)
    checkAndAwardBadges(session.userId).catch(console.error);

    // 21. Update hotel lastCouponAt
    await db.hotel.update({
      where: { id: hotelId },
      data: { lastCouponAt: now },
    });

    // 22. Return the coupon with hotel details
    return NextResponse.json({
      success: true,
      data: coupon,
      message: 'Coupon generated successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/coupons error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate coupon' },
      { status: 500 }
    );
  }
}
