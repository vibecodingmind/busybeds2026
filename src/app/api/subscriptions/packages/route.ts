import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/subscriptions/packages - Get all active subscription packages (public)
export async function GET() {
  try {
    const packages = await db.subscriptionPackage.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error('GET /api/subscriptions/packages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription packages' },
      { status: 500 }
    );
  }
}
