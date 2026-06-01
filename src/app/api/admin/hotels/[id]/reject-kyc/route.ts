import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { reason } = body;

    const owner = await db.hotelOwner.findUnique({ where: { hotelId: id } });
    if (owner) await db.hotelOwner.update({ where: { id: owner.id }, data: { kycStatus: 'rejected', kycReviewedAt: new Date(), kycRejectionReason: reason } });

    return NextResponse.json({ success: true, message: 'KYC rejected' });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to reject KYC' }, { status: 500 }); }
}
