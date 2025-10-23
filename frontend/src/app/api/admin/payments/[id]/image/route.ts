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
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const payment = await Payment.findById(params.id);
    if (!payment || !payment.image) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }

    // Return the image buffer with appropriate headers
    return new Response(new Uint8Array(payment.image.data), {
      headers: {
        'Content-Type': payment.image.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error fetching payment image:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}