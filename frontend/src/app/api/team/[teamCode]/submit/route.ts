import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Registration from '../../../../../models/Registration';
import { handleError } from '../../../../../lib/errorUtils';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '../../../../../lib/rateLimit';
import { 
  performSecurityCheck, 
  createErrorResponse,
  parseAndValidateJson,
  sanitizeString,
  sanitizeSearchParams
} from '../../../../../lib/security';

const submissionSchema = z.object({
  githubRepo: z.string().url('GitHub repository must be a valid URL'),
  liveDemo: z.string().url('Live demo must be a valid URL').optional().or(z.literal('')),
  presentationLink: z.string().url('Presentation link must be a valid URL').optional().or(z.literal('')),
  additionalNotes: z.string().max(1000, 'Additional notes must be at most 1000 characters').optional().or(z.literal('')),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamCode: string }> }
) {
  try {
    // Apply rate limiting for submissions
    const rateLimitCheck = rateLimit(rateLimitConfigs.teamSubmission)(request);
    if (rateLimitCheck) {
      return rateLimitCheck;
    }

    // Perform security checks
    const securityCheck = performSecurityCheck(request);
    if (!securityCheck.passed) {
      return createErrorResponse(
        'Security validation failed: ' + securityCheck.reason,
        403
      );
    }

    // Validate request size and parse JSON (max 50KB for submission)
    const jsonResult = await parseAndValidateJson(request, 50 * 1024);
    if (!jsonResult.success) {
      return createErrorResponse(jsonResult.error || 'Invalid request', 400);
    }

    await dbConnect();
    const { teamCode } = await params;
    const { searchParams } = new URL(request.url);
    const sanitizedParams = sanitizeSearchParams(searchParams);
    const projectName = sanitizedParams.projectName;
    const data = jsonResult.data;

    if (!teamCode || !teamCode.trim()) {
      return NextResponse.json(
        { message: 'Team code is required' },
        { status: 400 }
      );
    }

    if (!projectName || !projectName.trim()) {
      return NextResponse.json(
        { message: 'Project title is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedTeamCode = sanitizeString(teamCode).substring(0, 20);
    const sanitizedProjectName = sanitizeString(projectName).substring(0, 200);

    // Validate submission data
    const parsed = submissionSchema.safeParse(data);

    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { fieldErrors, formErrors },
        },
        { status: 400 }
      );
    }

    // Escape regex special characters
    const escapedProjectName = sanitizedProjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const team = await Registration.findOne({
      projectTitle: { $regex: new RegExp(`^${escapedProjectName}$`, 'i') },
      'members.0.phone': sanitizedTeamCode
    });

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (team.submissionStatus === 'submitted' || team.submissionStatus === 'under_review') {
      return NextResponse.json(
        { message: 'Project has already been submitted' },
        { status: 400 }
      );
    }

    // Update submission details and status
    const updatedTeam = await Registration.findOneAndUpdate(
      {
        projectTitle: { $regex: new RegExp(`^${escapedProjectName}$`, 'i') },
        'members.0.phone': sanitizedTeamCode
      },
      {
        submissionDetails: {
          githubRepo: parsed.data.githubRepo,
          liveDemo: parsed.data.liveDemo || '',
          presentationLink: parsed.data.presentationLink || '',
          additionalNotes: parsed.data.additionalNotes || '',
          submittedAt: new Date(),
        },
        submissionStatus: 'submitted',
      },
      { new: true, runValidators: true }
    ).select('-__v');

    return NextResponse.json(
      { 
        message: 'Project submitted successfully!',
        team: updatedTeam 
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}