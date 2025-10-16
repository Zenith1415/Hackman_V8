import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
// Admin endpoints rely on strong token auth; no rate limiting applied
import { isValidObjectId } from '@/lib/security';

function isAuthorized(request: NextRequest): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || '';

  return token === expected;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;

  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id;

  // Validate MongoDB ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
  }
  try {
    const body = await request.json();

    // Whitelist fields that can be updated
    const update: Record<string, unknown> = {};
    const allowedRoot = [
      'teamName',
      'collegeName',
      'projectTitle',
      'projectDescription',
      'teamLeadId',
      'teamCode',
      'submissionStatus',
      'selectionStatus',
      'paymentStatus',
      'reviewComments',
      'finalScore',
    ];
    for (const key of allowedRoot) {
      if (key in body) update[key] = body[key];
    }

    if (body.submissionDetails && typeof body.submissionDetails === 'object') {
      update.submissionDetails = {
        githubRepo: body.submissionDetails.githubRepo ?? '',
        liveDemo: body.submissionDetails.liveDemo ?? '',
        presentationLink: body.submissionDetails.presentationLink ?? '',
        additionalNotes: body.submissionDetails.additionalNotes ?? '',
        submittedAt: body.submissionDetails.submittedAt ?? null,
      };
    }

    if (Array.isArray(body.members)) {
      update.members = body.members.map((m: Record<string, string>) => ({
        name: m.name,
        email: m.email,
        phone: m.phone,
        usn: m.usn,
        linkedin: m.linkedin,
        github: m.github,
      }));
    }

    await dbConnect();
    // Remove unused variable
    const doc = await Registration.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!doc) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
  
    return NextResponse.json({ data: doc });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update registration';
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const params = await context.params;

  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id;

  // Validate MongoDB ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid ID format' }, { status: 400 });
  }
  try {
    await dbConnect();
    const doc = await Registration.findByIdAndDelete(id).lean();
    if (!doc) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data: doc });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to delete registration';
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}


