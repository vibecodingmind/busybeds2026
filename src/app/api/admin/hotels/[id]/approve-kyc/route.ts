import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    await db.hotel.update({ where: { id: id }, data: { partnershipStatus: 'ACTIVE', status: 'active' } });
    const owner = await db.hotelOwner.findUnique({ where: { hotelId: id } });
    if (owner) await db.hotelOwner.update({ where: { id: owner.id }, data: { kycStatus: 'approved', kycReviewedAt: new Date() } });

    return NextResponse.json({ success: true, message: 'KYC approved' });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to approve KYC' }, { status: 500 }); }
}
