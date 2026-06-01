import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    // Check DB connection by running a simple query
    await db.user.findFirst({ select: { id: true } });

    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        db: 'connected',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/health error:', error);
    return NextResponse.json({
      success: false,
      data: {
        status: 'error',
        db: 'disconnected',
        timestamp: new Date().toISOString(),
      },
    }, { status: 503 });
  }
}
