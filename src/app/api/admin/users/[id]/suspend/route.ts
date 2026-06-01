import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const { reason } = body;
    await db.user.update({ where: { id: params.id }, data: { suspendedAt: new Date(), suspendedReason: reason || 'Suspended by admin' } });
    return NextResponse.json({ success: true, message: 'User suspended' });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to suspend' }, { status: 500 }); }
}
