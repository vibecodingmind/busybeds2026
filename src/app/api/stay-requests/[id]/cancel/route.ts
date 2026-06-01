import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const stayRequest = await db.stayRequest.findUnique({ where: { id: params.id } });
    if (!stayRequest) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (stayRequest.travelerId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updated = await db.stayRequest.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Stay cancel error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cancel' }, { status: 500 });
  }
}
