import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimit, rateLimitConfigs } from '../../../lib/rateLimit';
import { 
  performSecurityCheck, 
  parseAndValidateJson, 
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

    // Validate request size and parse JSON (max 50KB for contact form)
    const jsonResult = await parseAndValidateJson<{ name: string; email: string; message: string }>(
      request, 
      50 * 1024
    );
    if (!jsonResult.success) {
      return createErrorResponse(jsonResult.error || 'Invalid request', 400);
    }

    const { name, email, message } = jsonResult.data!;
    
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
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"${sanitizedName}" <${email}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Submission from ${sanitizedName}`,
      html: `<p>You have a new submission from the contact form of HackmanV8:</p>
             <p><strong>Name:</strong> ${sanitizedName}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>`,
    };
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}