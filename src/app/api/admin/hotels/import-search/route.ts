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
    const region = searchParams.get('region') || '';

    if (!query) return NextResponse.json({ success: false, error: 'query required' }, { status: 400 });

    // Use region if provided and city is empty
    const searchCity = city || (region && region !== 'All Regions' ? region : '');
    const results = await searchHotels(query, searchCity);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
