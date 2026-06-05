import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic rendering — never cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const base = request.nextUrl.searchParams.get('base') || 'USD';
    const target = request.nextUrl.searchParams.get('target') || 'TZS';

    // Check cache
    const cached = await db.exchangeRate.findFirst({
      where: { base, target },
      orderBy: { fetchedAt: 'desc' },
    });

    // Use cache if less than 1 hour old
    if (cached && Date.now() - cached.fetchedAt.getTime() < 3600000) {
      return NextResponse.json({ success: true, data: { base, target, rate: cached.rate, source: 'cache' } });
    }

    // Fetch from exchangerate-api (free tier)
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      const data = await res.json();
      const rate = data.rates?.[target];

      if (rate) {
        await db.exchangeRate.upsert({
          where: { id: `${base}_${target}` },
          create: { base, target, rate, source: 'api' },
          update: { rate, source: 'api', fetchedAt: new Date() },
        }).catch(() => {
          // fallback if id constraint fails
          db.exchangeRate.create({ data: { base, target, rate, source: 'api' } }).catch(() => {});
        });

        return NextResponse.json({ success: true, data: { base, target, rate, source: 'live' } });
      }
    } catch { /* API failed, use fallback */ }

    // Fallback rates (approximate)
    const fallbackRates: Record<string, number> = { TZS: 2580, KES: 155, EUR: 0.92, GBP: 0.79, USD: 1 };
    const fallbackRate = target === base ? 1 : (fallbackRates[target] || 1);

    return NextResponse.json({ success: true, data: { base, target, rate: fallbackRate, source: 'fallback' } });
  } catch (error) {
    console.error('Exchange rate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
