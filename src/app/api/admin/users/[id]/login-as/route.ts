import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, signToken } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const user = await db.user.findUnique({ where: { id: id } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const token = await signToken({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion });
    return NextResponse.json({ success: true, data: { token } });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to impersonate' }, { status: 500 }); }
}
