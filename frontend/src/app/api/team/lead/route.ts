import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Registration from '../../../../models/Registration';
import { handleError } from '../../../../lib/errorUtils';
import { rateLimit, rateLimitConfigs } from '../../../../lib/rateLimit';
import { 
  performSecurityCheck, 
  createErrorResponse,
  sanitizeString,
  sanitizeSearchParams,
  isValidEmail
} from '../../../../lib/security';

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const sanitizedParams = sanitizeSearchParams(searchParams);
    const email = sanitizedParams.email;
    const phone = sanitizedParams.phone;
    
    if (!email || !email.trim()) {
      return NextResponse.json({ message: 'Team lead email is required' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ message: 'Team lead phone number is required' }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email).toLowerCase().substring(0, 254);
    const sanitizedPhone = sanitizeString(phone).substring(0, 15);

    // Query for team using sanitized inputs
    const team = await Registration.findOne({
      $expr: {
        $and: [
          { 
            $eq: [
              { $toLower: { $arrayElemAt: [ "$members.email", "$teamLeadId" ] } },
              sanitizedEmail
            ]
          },
          { 
            $eq: [
              { $arrayElemAt: [ "$members.phone", "$teamLeadId" ] },
              sanitizedPhone
            ]
          }
        ]
      }
    }).select('-__v');

    if (team) {
      return NextResponse.json(team, { status: 200 });
    }

    return NextResponse.json({ message: 'Team not found or invalid credentials' }, { status: 404 });
    
  } catch (error: unknown) {
    return handleError(error);
  }
}
