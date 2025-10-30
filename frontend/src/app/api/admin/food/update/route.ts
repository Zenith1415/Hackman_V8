import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FoodLog from '@/models/FoodLog';
// No ObjectId casting; FoodLog uses string _id

function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || '';
  return Boolean(expected) && token === expected;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { docId, field, status } = await request.json();

    if (!docId || !field || typeof status !== 'boolean') {
      return NextResponse.json(
        { message: 'Missing required fields: docId, field, status' },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await FoodLog.updateOne(
      { _id: docId },
      { [field]: status }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Status updated successfully' },
      { status: 200 }
    );
  } catch (error: unknown) { // <-- Fix 4: Use unknown
    let message = 'Internal server error';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error('API Error:', error);
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 }
    );
  }
}