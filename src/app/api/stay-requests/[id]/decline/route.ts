import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager', 'admin'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { declineReason } = body;

    const stayRequest = await db.stayRequest.update({
      where: { id: params.id },
      data: { status: 'declined', declineReason, managerId: session.userId },
    });

    await createNotification({
      userId: stayRequest.travelerId,
      type: 'stay_declined',
      title: 'Stay Request Declined',
      body: declineReason || 'Your stay request was declined.',
      link: '/my-stay-requests',
    });

    return NextResponse.json({ success: true, data: stayRequest });
  } catch (error) {
    console.error('Stay decline error:', error);
    return NextResponse.json({ success: false, error: 'Failed to decline' }, { status: 500 });
  }
}
