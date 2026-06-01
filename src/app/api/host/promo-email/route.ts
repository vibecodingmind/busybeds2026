import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { subject, body: emailBody } = body;
    if (!subject || !emailBody) {
      return NextResponse.json({ success: false, error: 'Subject and body required' }, { status: 400 });
    }

    console.log(`[PROMO EMAIL] From hotel owner ${session.userId}: ${subject}`);
    return NextResponse.json({ success: true, message: 'Promo email queued' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send promo email' }, { status: 500 });
  }
}
