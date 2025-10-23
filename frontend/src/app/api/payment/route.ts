import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Payment from '../../../models/Payment';
import { rateLimit, rateLimitConfigs } from '../../../lib/rateLimit';
import {
  performSecurityCheck,
  createErrorResponse,
  sanitizeString,
  isValidEmail
} from '../../../lib/security';

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
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const image = formData.get('image') as File | null;

    // Validate and sanitize inputs
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please fill all fields.' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message is too long. Maximum 2000 characters.' }, { status: 400 });
    }

    const sanitizedName = sanitizeString(name).substring(0, 100);
    const sanitizedMessage = sanitizeString(message).substring(0, 2000);

    // Connect to database
    await dbConnect();

    // Prepare payment data
    const paymentData: Record<string, unknown> = {
      name: sanitizedName,
      email,
      message: sanitizedMessage,
    };

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      paymentData.image = {
        data: buffer,
        contentType: image.type,
        filename: image.name,
      };
    }

    // Save to database
    const payment = new Payment(paymentData);
    await payment.save();

    return NextResponse.json({ message: 'Payment data saved successfully!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save data.' }, { status: 500 });
  }
}