import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Registration from '@/models/Registration';
// Admin endpoints rely on strong token auth; no rate limiting applied
import { isValidObjectId } from '@/lib/security';
import { sendSelectionEmail } from '@/lib/selectionEmail';
import { sendRejectionEmail } from '@/lib/rejectionEmail';

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

    // Fetch existing document to detect status transition
    const existing = await Registration.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const update: Record<string, unknown> = { selectionStatus };
    if (typeof reviewComments === 'string') update.reviewComments = reviewComments;
    if (typeof finalScore === 'number' || finalScore === null) update.finalScore = finalScore;

    const updated = await Registration.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    // If transitioning to selected, send email notification to team members
    const transitionedToSelected = selectionStatus === 'selected' && existing.selectionStatus !== 'selected';
    if (transitionedToSelected) {
      try {
        type MemberLike = { email?: string };
        const membersUnknown: unknown = (updated as unknown as { members?: unknown }).members;
        const recipients: string[] = Array.isArray(membersUnknown)
          ? (membersUnknown as MemberLike[])
              .map((m) => m.email)
              .filter((e): e is string => typeof e === 'string' && e.length > 0)
          : [];
        await sendSelectionEmail({ teamName: updated.teamName, teamCode: updated.teamCode, recipients });
      } catch (emailErr) {
        console.error('Failed to send selection email(s):', emailErr);
        // Do not fail the request if email sending fails
      }
    }

    // If transitioning to rejected, send rejection email notification (to team lead only)
    const transitionedToRejected = selectionStatus === 'rejected' && existing.selectionStatus !== 'rejected';
    if (transitionedToRejected) {
      try {
        type MemberLike = { email?: string };
        const membersUnknown: unknown = (updated as unknown as { members?: unknown }).members;
        const teamLeadIndex = typeof (updated as unknown as { teamLeadId?: unknown }).teamLeadId === 'number'
          ? (updated as unknown as { teamLeadId: number }).teamLeadId
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
        console.info(`Attempting to send rejection email to team ${updated.teamCode} with recipients:`, recipients);
        await sendRejectionEmail({ teamName: updated.teamName, teamCode: updated.teamCode, recipients });
        console.info(`Rejection email sent successfully for team ${updated.teamCode}`);
      } catch (emailErr) {
        console.error('Failed to send rejection email(s):', emailErr);
        // Do not fail the request if email sending fails
      }
    }

    return NextResponse.json({ data: updated });
  } catch (_error) {
    return NextResponse.json({ message: 'Failed to update selection' }, { status: 500 });
  }
}


