import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
import { sendRejectionEmail } from '@/lib/rejectionEmail';
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

    // Fetch existing to detect transitions on selectionStatus
    const existing = await Registration.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const doc = await Registration.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!doc) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    // If selectionStatus transitioned to rejected via this generic endpoint, send email (to team lead only)
    if (typeof body.selectionStatus === 'string' && body.selectionStatus === 'rejected' && existing.selectionStatus !== 'rejected') {
      try {
        type MemberLike = { email?: string };
        const membersUnknown: unknown = (doc as unknown as { members?: unknown }).members;
        const teamLeadIndex = typeof (doc as unknown as { teamLeadId?: unknown }).teamLeadId === 'number'
          ? (doc as unknown as { teamLeadId: number }).teamLeadId
          : 0;
        let recipients: string[] = [];
        if (Array.isArray(membersUnknown)) {
          const members = membersUnknown as MemberLike[];
          const leadEmail = members[teamLeadIndex]?.email;
          if (typeof leadEmail === 'string' && leadEmail.length > 0) {
            recipients = [leadEmail];
          } else {
            const first = members.find(m => typeof m.email === 'string' && m.email.length > 0)?.email;
            if (first) recipients = [first];
          }
        }
        console.info(`Attempting to send rejection email to team ${doc.teamCode} with recipients:`, recipients);
        await sendRejectionEmail({ teamName: doc.teamName, teamCode: doc.teamCode, recipients });
        console.info(`Rejection email sent successfully for team ${doc.teamCode}`);
      } catch (emailErr) {
        console.error('Failed to send rejection email(s):', emailErr);
        // Do not fail the request if email sending fails
      }
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


