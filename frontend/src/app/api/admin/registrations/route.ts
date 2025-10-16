import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
// Admin endpoints rely on strong token auth; no rate limiting applied

function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || '';

  return token === expected;
}

export async function GET(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await dbConnect();
    const registrations = await Registration.find({})
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ data: registrations });
  } catch (_error) {
    console.error('Error fetching registrations:', _error);
    return NextResponse.json({ message: 'Error fetching registrations' }, { status: 500 });
  }
}
