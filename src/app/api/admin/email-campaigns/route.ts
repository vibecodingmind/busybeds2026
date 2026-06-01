import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { subject, html, segment } = body;
    console.log(`[EMAIL CAMPAIGN] Subject: ${subject}, Segment: ${segment || 'all'}`);
    return NextResponse.json({ success: true, message: 'Email campaign queued' });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 }); }
}
