import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1';

    return NextResponse.json({
      success: true,
      data: { ip, city: 'Dar es Salaam', country: 'Tanzania' },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to detect location' }, { status: 500 });
  }
}
