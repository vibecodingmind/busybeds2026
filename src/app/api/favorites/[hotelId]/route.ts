import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ hotelId: string }> }) {
  try {
    const { hotelId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const existing = await db.favorite.findFirst({
      where: { userId: session.userId, hotelId: hotelId },
    });
    if (existing) return NextResponse.json({ success: true, data: existing });

    const fav = await db.favorite.create({
      data: { userId: session.userId, hotelId: hotelId },
    });

    return NextResponse.json({ success: true, data: fav }, { status: 201 });
  } catch (error) {
    console.error('Favorite add error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add favorite' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ hotelId: string }> }) {
  try {
    const { hotelId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await db.favorite.deleteMany({
      where: { userId: session.userId, hotelId: hotelId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorite remove error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove favorite' }, { status: 500 });
  }
}
