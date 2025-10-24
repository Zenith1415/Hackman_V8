import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Registration from '../../../../models/Registration';
import { rateLimit, rateLimitConfigs } from '../../../../lib/rateLimit';
import {
  performSecurityCheck,
  createErrorResponse,
  sanitizeString,
} from '../../../../lib/security';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitCheck = rateLimit(rateLimitConfigs.contact)(request);
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

    // Parse FormData
    const formData = await request.formData();
    const teamId = formData.get('teamId') as string;
    const paymentDate = formData.get('paymentDate') as string;
    const paymentProof = formData.get('paymentProof') as File | null;

    // Validate inputs
    if (!teamId || !paymentDate) {
      return NextResponse.json({ error: 'Team ID and payment date are required.' }, { status: 400 });
    }

    if (!paymentProof) {
      return NextResponse.json({ error: 'Payment proof image is required.' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (paymentProof.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB.' }, { status: 400 });
    }

    // Validate file type
    if (!paymentProof.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Convert image to base64 for storage
    const buffer = Buffer.from(await paymentProof.arrayBuffer());
    const base64Image = `data:${paymentProof.type};base64,${buffer.toString('base64')}`;

    // Update team registration with payment information
    const updatedTeam = await Registration.findByIdAndUpdate(
      teamId,
      {
        $set: {
          paymentStatus: 'paid',
          paymentProof: base64Image,
          paymentDate: new Date(paymentDate),
          updatedAt: new Date(),
        }
      },
      { new: true, runValidators: false }
    );

    if (!updatedTeam) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Payment proof submitted successfully!',
      team: {
        _id: updatedTeam._id,
        paymentStatus: updatedTeam.paymentStatus,
        paymentDate: updatedTeam.paymentDate,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json({ error: 'Failed to submit payment proof.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required.' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();

    // Get team payment information
    const team = await Registration.findById(teamId).select('paymentStatus paymentProof paymentDate');

    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    return NextResponse.json({
      paymentStatus: team.paymentStatus || 'unpaid',
      paymentProof: team.paymentProof || null,
      paymentDate: team.paymentDate || null,
    }, { status: 200 });

  } catch (error) {
    console.error('Payment fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment information.' }, { status: 500 });
  }
}
