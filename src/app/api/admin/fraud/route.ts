import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const flagged = await db.user.findMany({
      where: { isFlagged: true },
      select: { id: true, email: true, fullName: true, spamScore: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: flagged });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch fraud queue' }, { status: 500 }); }
}
