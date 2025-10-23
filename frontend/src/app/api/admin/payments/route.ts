import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';

function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || '';

  return token === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const payments = await Payment.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}