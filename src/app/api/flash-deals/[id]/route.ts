import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const deal = await db.flashDeal.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    console.error('Flash deal update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update flash deal' }, { status: 500 });
  }
}
