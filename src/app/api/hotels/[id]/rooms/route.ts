import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  bedType: z.string().min(1, 'Bed type is required'),
  sizeSqm: z.number().positive().optional(),
  pricePerNight: z.number().positive('Price per night is required'),
  maxGuests: z.number().int().min(1).default(2),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

// GET /api/hotels/[id]/rooms - Get active room types for hotel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const hotel = await db.hotel.findUnique({ where: { id } });
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    const rooms = await db.roomType.findMany({
      where: { hotelId: id, isActive: true },
      orderBy: { pricePerNight: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error('GET /api/hotels/[id]/rooms error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// POST /api/hotels/[id]/rooms - Create room type (owner/manager/admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const hotel = await db.hotel.findUnique({ where: { id } });
    if (!hotel) {
      return NextResponse.json(
        { success: false, error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const isOwner = await db.hotelOwner.findFirst({
      where: { userId: session.userId, hotelId: id },
    });
    const isManager = await db.hotelManager.findFirst({
      where: { userId: session.userId, hotelId: id, isActive: true },
    });
    if (session.role !== 'admin' && !isOwner && !isManager) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to add rooms to this hotel' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createRoomSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', message: validation.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const data = validation.data;
    const room = await db.roomType.create({
      data: {
        hotelId: id,
        name: data.name,
        bedType: data.bedType,
        sizeSqm: data.sizeSqm || null,
        pricePerNight: data.pricePerNight,
        maxGuests: data.maxGuests,
        description: data.description || null,
        images: JSON.stringify(data.images || []),
      },
    });

    return NextResponse.json({
      success: true,
      data: room,
      message: 'Room type created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/hotels/[id]/rooms error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room type' },
      { status: 500 }
    );
  }
}
