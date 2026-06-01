import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (search) { where.OR = [{ fullName: { contains: search } }, { email: { contains: search } }]; }
    if (role) where.role = role;

    const users = await db.user.findMany({
      where,
      select: { id: true, email: true, fullName: true, role: true, createdAt: true, isBanned: true, emailVerified: true, avatar: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await db.user.count({ where });

    return NextResponse.json({ success: true, data: users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 }); }
}
