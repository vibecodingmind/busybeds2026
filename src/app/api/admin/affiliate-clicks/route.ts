import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ success: true, data: [] });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch clicks' }, { status: 500 }); }
}
