import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const suggestions = await db.hotelSuggestion.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with user info
    const enriched = await Promise.all(suggestions.map(async (s) => {
      const user = await db.user.findUnique({ where: { id: s.userId }, select: { id: true, fullName: true, email: true } });
      return { ...s, user };
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });

    const suggestion = await db.hotelSuggestion.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: suggestion });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update suggestion' }, { status: 500 });
  }
}
