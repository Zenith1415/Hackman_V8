import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';

function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || '';
  return token === expected;
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  let id: string;
  if (context.params instanceof Promise) {
    const resolved = await context.params;
    id = resolved.id;
  } else {
    id = context.params.id;
  }
  try {
    await dbConnect();
    const payment = await Payment.findById(id);
    if (!payment || !payment.image) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }
    return new Response(new Uint8Array(payment.image.data), {
      headers: {
        'Content-Type': payment.image.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error fetching payment image:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}