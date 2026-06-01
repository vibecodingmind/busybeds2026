import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { recipientEmail: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const giftCards = await db.giftCard.findMany({
      where,
      orderBy: { purchasedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Fetch purchaser info
    const purchaserIds = [...new Set(giftCards.map(g => g.purchasedById).filter(Boolean))] as string[];
    const purchasers = await db.user.findMany({
      where: { id: { in: purchaserIds } },
      select: { id: true, fullName: true, email: true },
    });
    const purchaserMap = Object.fromEntries(purchasers.map(p => [p.id, p]));
    const giftCardsWithPurchaser = giftCards.map(g => ({
      ...g,
      purchaser: g.purchasedById ? purchaserMap[g.purchasedById] || null : null,
    }));

    const total = await db.giftCard.count({ where });

    return NextResponse.json({ success: true, data: giftCardsWithPurchaser, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch gift cards' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, recipientEmail, recipientName, message } = body;
    if (!amount) return NextResponse.json({ success: false, error: 'Amount required' }, { status: 400 });

    const code = 'GC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const giftCard = await db.giftCard.create({
      data: { code, amount, balance: amount, recipientEmail, recipientName, message, isActive: true },
    });

    return NextResponse.json({ success: true, data: giftCard }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to create gift card' }, { status: 500 }); }
}
