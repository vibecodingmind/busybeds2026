import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { amount, recipientEmail, recipientName } = body;
    if (!amount) return NextResponse.json({ success: false, error: 'Amount required' }, { status: 400 });

    const code = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const giftCard = await db.giftCard.create({
      data: { code, amount, balance: amount, recipientEmail, recipientName, isActive: true },
    });

    return NextResponse.json({ success: true, data: giftCard }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to create gift card' }, { status: 500 }); }
}
