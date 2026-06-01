import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { searchHotels } from '@/lib/googlePlaces';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const city = searchParams.get('city') || '';

    if (!query || !city) return NextResponse.json({ success: false, error: 'query and city required' }, { status: 400 });

    const results = await searchHotels(query, city);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
