import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    await db.user.update({ where: { id: params.id }, data: { isBanned: true } });
    return NextResponse.json({ success: true, message: 'User banned' });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to ban' }, { status: 500 }); }
}
