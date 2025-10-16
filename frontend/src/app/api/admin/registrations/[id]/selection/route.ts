import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
// Admin endpoints rely on strong token auth; no rate limiting applied
import { isValidObjectId } from '@/lib/security';

function isAuthorized(request: NextRequest): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  
  const expected = process.env.ADMIN_SELECT_TOKEN || '';
  
  return Boolean(expected) && token === expected;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  // Validate MongoDB ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const { selectionStatus, reviewComments, finalScore } = body || {};

    const allowed = ['pending', 'selected', 'waitlisted', 'rejected'];
    if (!allowed.includes(selectionStatus)) {
      return NextResponse.json({ message: 'Invalid selectionStatus' }, { status: 400 });
    }

    await dbConnect();
    const update: Record<string, unknown> = { selectionStatus };
    if (typeof reviewComments === 'string') update.reviewComments = reviewComments;
    if (typeof finalScore === 'number' || finalScore === null) update.finalScore = finalScore;

    const doc = await Registration.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
   
    
    return NextResponse.json({ data: doc });
  } catch (_error) {
    return NextResponse.json({ message: 'Failed to update selection' }, { status: 500 });
  }
}


