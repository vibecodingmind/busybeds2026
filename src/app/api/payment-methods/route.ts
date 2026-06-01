import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const methods = await db.paymentMethod.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, data: methods });
  } catch (error) {
    console.error('GET /api/payment-methods error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, last4, brand, expiryMonth, expiryYear, mobileNumber, mobileProvider } = body;

    if (!type || !['card', 'mobile'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Invalid payment method type' }, { status: 400 });
    }

    // Count existing methods
    const count = await db.paymentMethod.count({ where: { userId: session.userId } });
    if (count >= 10) {
      return NextResponse.json({ success: false, error: 'Maximum 10 payment methods allowed' }, { status: 400 });
    }

    const method = await db.paymentMethod.create({
      data: {
        userId: session.userId,
        type,
        last4: type === 'card' ? last4 : undefined,
        brand: type === 'card' ? brand : undefined,
        expiryMonth: type === 'card' ? expiryMonth : undefined,
        expiryYear: type === 'card' ? expiryYear : undefined,
        mobileNumber: type === 'mobile' ? mobileNumber : undefined,
        mobileProvider: type === 'mobile' ? mobileProvider : undefined,
        isDefault: count === 0, // First method is default
      },
    });

    return NextResponse.json({ success: true, data: method });
  } catch (error) {
    console.error('POST /api/payment-methods error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, isDefault } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    // Verify ownership
    const method = await db.paymentMethod.findFirst({ where: { id, userId: session.userId } });
    if (!method) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (isDefault) {
      // Unset all other defaults
      await db.paymentMethod.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
      await db.paymentMethod.update({
        where: { id },
        data: { isDefault: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/payment-methods error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    // Verify ownership
    const method = await db.paymentMethod.findFirst({ where: { id, userId: session.userId } });
    if (!method) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    await db.paymentMethod.delete({ where: { id } });

    // If deleted was default, set another as default
    if (method.isDefault) {
      const next = await db.paymentMethod.findFirst({ where: { userId: session.userId } });
      if (next) await db.paymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/payment-methods error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
