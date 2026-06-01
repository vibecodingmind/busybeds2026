import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string; blackoutId: string } }) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager', 'admin'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await db.couponBlackout.delete({ where: { id: params.blackoutId } });
    return NextResponse.json({ success: true, message: 'Blackout deleted' });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to delete blackout' }, { status: 500 }); }
}
