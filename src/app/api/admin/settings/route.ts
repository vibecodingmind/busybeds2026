import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const settings = await db.siteSettings.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });

    return NextResponse.json({ success: true, data: settingsMap });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { key, value } = body;
    if (!key || value === undefined) return NextResponse.json({ success: false, error: 'Key and value required' }, { status: 400 });

    const setting = await db.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value: String(value) },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (error) { return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 }); }
}
