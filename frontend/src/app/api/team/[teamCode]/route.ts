import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Registration from '../../../../models/Registration';
import { handleError } from '../../../../lib/errorUtils';
import { rateLimit, rateLimitConfigs } from '../../../../lib/rateLimit';
import { 
  performSecurityCheck, 
  createErrorResponse,
  sanitizeString,
  sanitizeSearchParams
} from '../../../../lib/security';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamCode: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitCheck = rateLimit(rateLimitConfigs.teamAccess)(request);
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

    await dbConnect();
    const { teamCode } = await params;
    const { searchParams } = new URL(request.url);
    const sanitizedParams = sanitizeSearchParams(searchParams);
    const projectName = sanitizedParams.projectName;

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

    // Sanitize inputs to prevent injection
    const sanitizedTeamCode = sanitizeString(teamCode).substring(0, 20);
    const sanitizedProjectName = sanitizeString(projectName).substring(0, 200);

    // Escape regex special characters to prevent ReDoS attacks
    const escapedProjectName = sanitizedProjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const team = await Registration.findOne({ 
      teamCode: sanitizedTeamCode.toUpperCase(),
      projectTitle: { $regex: new RegExp(`^${escapedProjectName}$`, 'i') }
    }).select('-__v');

    if (!team) {
      return NextResponse.json(
  { message: 'Invalid credentials. Please check your project title and team code.' },
        { status: 404 }
      );
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ teamCode: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitCheck = rateLimit(rateLimitConfigs.teamAccess)(request);
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

    await dbConnect();
    const { teamCode } = await params;
    const { searchParams } = new URL(request.url);
    const sanitizedParams = sanitizeSearchParams(searchParams);
    const projectName = sanitizedParams.projectName;
    const data = await request.json();

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

    const updateData: Record<string, unknown> = {};
    
    // Handle nested submissionDetails
    if (data.submissionDetails) {
      updateData.submissionDetails = {
        githubRepo: data.submissionDetails.githubRepo || '',
        liveDemo: data.submissionDetails.liveDemo || '',
        presentationLink: data.submissionDetails.presentationLink || '',
        additionalNotes: data.submissionDetails.additionalNotes || '',
        submittedAt: data.submissionDetails.submittedAt || null,
      };
    }

    // Handle direct fields with validation
    if (data.projectTitle && typeof data.projectTitle === 'string') {
      updateData.projectTitle = sanitizeString(data.projectTitle).substring(0, 200);
    }
    if (data.projectDescription && typeof data.projectDescription === 'string') {
      updateData.projectDescription = sanitizeString(data.projectDescription).substring(0, 1500);
    }
    if (data.submissionStatus && ['pending', 'submitted', 'under_review'].includes(data.submissionStatus)) {
      updateData.submissionStatus = data.submissionStatus;
    }

    // Escape regex special characters
    const escapedProjectName = sanitizedProjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const team = await Registration.findOneAndUpdate(
      { 
        teamCode: sanitizedTeamCode.toUpperCase(),
        projectTitle: { $regex: new RegExp(`^${escapedProjectName}$`, 'i') }
      },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!team) {
      return NextResponse.json(
        { message: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error: unknown) {
    return handleError(error);
  }
}
