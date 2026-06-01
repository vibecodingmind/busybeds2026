import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { packageId, reason } = body;
    if (!packageId) return NextResponse.json({ success: false, error: 'Package ID required' }, { status: 400 });

    const pkg = await db.subscriptionPackage.findUnique({ where: { id: packageId } });
    if (!pkg) return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });

    const sub = await db.subscription.create({
      data: {
        userId: params.id,
        packageId,
        status: 'active',
        billingCycle: 'monthly',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + pkg.durationDays * 86400000),
        compedBy: session.userId,
        compedReason: reason || 'Admin comp',
      },
    });

    return NextResponse.json({ success: true, data: sub }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to comp subscription' }, { status: 500 }); }
}
