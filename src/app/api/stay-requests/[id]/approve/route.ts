import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !['owner', 'manager', 'admin'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const stayRequest = await db.stayRequest.update({
      where: { id: id },
      data: { status: 'approved', managerId: session.userId },
    });

    await createNotification({
      userId: stayRequest.travelerId,
      type: 'stay_approved',
      title: 'Stay Request Approved',
      body: `Your stay request has been approved!`,
      link: '/my-stay-requests',
    });

    return NextResponse.json({ success: true, data: stayRequest });
  } catch (error) {
    console.error('Stay approve error:', error);
    return NextResponse.json({ success: false, error: 'Failed to approve' }, { status: 500 });
  }
}
