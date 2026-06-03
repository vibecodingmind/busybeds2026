import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Please log in to continue' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // Check if user already owns a hotel
    const existingOwner = await db.hotelOwner.findUnique({
      where: { userId: session.userId },
    });

    if (existingOwner) {
      return NextResponse.json({
        success: false,
        error: 'You already have a hotel registered. Go to your Hotel Portal to manage it.',
      }, { status: 400 });
    }

    if (action === 'claim') {
      // Claim an existing hotel
      const { hotelId, discountPercent, couponValidDays } = body;

      if (!hotelId) {
        return NextResponse.json({ success: false, error: 'Hotel ID is required' }, { status: 400 });
      }

      // Verify hotel exists and isn't already claimed
      const hotel = await db.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel) {
        return NextResponse.json({ success: false, error: 'Hotel not found' }, { status: 404 });
      }

      // Check if hotel already has an owner
      const existingClaim = await db.hotelOwner.findUnique({ where: { hotelId } });
      if (existingClaim) {
        return NextResponse.json({ success: false, error: 'This hotel already has a registered owner' }, { status: 409 });
      }

      // Create ownership record and update hotel
      await db.hotelOwner.create({
        data: {
          userId: session.userId,
          hotelId,
          kycStatus: 'pending',
        },
      });

      // Update hotel with discount info and partnership status
      await db.hotel.update({
        where: { id: hotelId },
        data: {
          discountPercent: discountPercent || hotel.discountPercent,
          couponValidDays: couponValidDays || hotel.couponValidDays,
          partnershipStatus: 'COUPON_PARTNER',
          isPartner: true,
        },
      });

      // Update user role to owner
      await db.user.update({
        where: { id: session.userId },
        data: { role: 'owner' },
      });

      return NextResponse.json({
        success: true,
        message: 'Hotel claimed successfully. Your ownership is pending verification.',
      });

    } else if (action === 'create') {
      // Create a new hotel listing
      const { hotelName, city, country, category, descriptionShort, descriptionLong, starRating, discountPercent, couponValidDays, amenities, vibeTags } = body;

      if (!hotelName || !city || !country) {
        return NextResponse.json({ success: false, error: 'Hotel name, city, and country are required' }, { status: 400 });
      }

      const slug = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6);

      const hotel = await db.hotel.create({
        data: {
          name: hotelName,
          slug,
          city,
          country,
          category: category || 'Hotel',
          descriptionShort: descriptionShort || '',
          descriptionLong: descriptionLong || '',
          starRating: starRating || 3,
          discountPercent: discountPercent || 15,
          couponValidDays: couponValidDays || 30,
          amenities: JSON.stringify(amenities || []),
          vibeTags: JSON.stringify(vibeTags || []),
          status: 'pending',
          partnershipStatus: 'COUPON_PARTNER',
          isPartner: true,
        },
      });

      await db.hotelOwner.create({
        data: {
          userId: session.userId,
          hotelId: hotel.id,
          kycStatus: 'pending',
        },
      });

      // Update user role to owner
      await db.user.update({
        where: { id: session.userId },
        data: { role: 'owner' },
      });

      return NextResponse.json({
        success: true,
        message: 'Hotel application submitted successfully.',
      });

    } else {
      return NextResponse.json({ success: false, error: 'Invalid action. Use "claim" or "create".' }, { status: 400 });
    }

  } catch (error) {
    console.error('Owner onboard error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
