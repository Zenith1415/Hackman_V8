import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Registration from '../../../models/Registration';
import { handleError } from '../../../lib/errorUtils';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { rateLimit, rateLimitConfigs } from '../../../lib/rateLimit';
import { 
  performSecurityCheck, 
  parseAndValidateJson, 
  createErrorResponse,
  sanitizeString 
} from '../../../lib/security';
interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  usn?: string;
  linkedin?: string;
  github?: string;
}
interface RegistrationData {
  teamName: string;
  collegeName: string;
  projectTitle: string;
  projectDescription: string;
  teamLeadId: number | null;
  members: TeamMember[];
}
export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimitCheck = rateLimit(rateLimitConfigs.registration)(request);
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

    // Validate request size and parse JSON (max 100KB for registration)
    const jsonResult = await parseAndValidateJson<RegistrationData>(request, 100 * 1024);
    if (!jsonResult.success) {
      return createErrorResponse(jsonResult.error || 'Invalid request', 400);
    }

    await dbConnect();
    const data = jsonResult.data!;
    console.log('Received registration data:', JSON.stringify(data, null, 2));
    const teamMemberSchema = z.object({
      id: z.number(),
      name: z.string().trim().min(1, 'Member name is required'),
      email: z.string().trim().email('Invalid member email'),
      phone: z
        .string()
        .trim()
        .refine((phone) => {
          const digits = phone.replace(/\D/g, '');
          return digits.length === 10;
        }, 'Phone must contain exactly 10 digits'),
      usn: z
        .string()
        .trim()
        .optional()
        .refine((usn) => {
          if (!usn || usn === '') return true; // USN is optional
          return /^1[a-z]{2}2[1-5][a-z]{2}\d{3}$/i.test(usn);
        }, 'USN must match format'),
      linkedin: z
        .string()
        .trim()
        .url({ message: 'Invalid LinkedIn URL' })
        .refine((u) => /^(https?:\/\/)?([a-z0-9-]+\.)*linkedin\.com\//i.test(u), {
          message: 'LinkedIn URL must be from linkedin.com',
          path: ['linkedin'],
        }),
      github: z
        .string()
        .trim()
        .url({ message: 'Invalid GitHub URL' })
        .refine((u) => /^(https?:\/\/)?([a-z0-9-]+\.)*github\.com\//i.test(u), {
          message: 'GitHub URL must be from github.com',
          path: ['github'],
        }),
    });
    const registrationSchema = z
      .object({
        teamName: z.string().trim().min(1, 'Team name is required').max(100, 'Team name too long'),
        collegeName: z.string().trim().min(1, 'College name is required').max(200, 'College name too long'),
        projectTitle: z.string().trim().min(1, 'Project title is required').max(200, 'Project title too long'),
        projectDescription: z
          .string()
          .trim()
          .min(1, 'Project description is required')
          .max(1500, 'Project description must be at most 1500 characters'),
        teamLeadId: z.number().nullable().default(0),
        members: z.array(teamMemberSchema).min(2).max(4),
      })
      .refine(({ members }) => {
        const emails = members.map((m) => m.email.toLowerCase());
        return new Set(emails).size === emails.length;
      }, {
        message: 'Each team member must have a unique email address',
        path: ['members'],
      })
      .refine(({ teamLeadId, members }) => {
        if (teamLeadId === null || teamLeadId === 0) return true;
        return members.some((m) => m.id === teamLeadId);
      }, {
        message: 'teamLeadId must refer to one of the members',
        path: ['teamLeadId'],
      });
    const parsed = registrationSchema.safeParse(data);
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      console.log('Validation failed:', { fieldErrors, formErrors });
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: { fieldErrors, formErrors },
        },
        { status: 400 }
      );
    }
      const allEmails = parsed.data.members.map((m: TeamMember) => m.email.trim().toLowerCase());
      const duplicateEmail = await Registration.findOne({
        'members.email': { $in: allEmails }
      });
      if (duplicateEmail) {
        return NextResponse.json({
          message: 'One or more member emails are already registered with another team/project. Each email can only be used for one project.',
        }, { status: 400 });
      }
    const generateTeamCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    let teamCode;
    let isUnique = false;
    while (!isUnique) {
      teamCode = generateTeamCode();
      const existingTeam = await Registration.findOne({ teamCode });
      if (!existingTeam) {
        isUnique = true;
      }
    }
    const registrationData = {
      ...parsed.data,
      teamCode,
    };
    const newRegistration = await Registration.create(registrationData);
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });
      const emailPromises = parsed.data.members.map((member) => {
        return transporter.sendMail({
          from: `"Hackathon Team" <${process.env.EMAIL_SERVER_USER}>`,
          to: member.email,
          subject: '✅ Your Hackathon Registration is Confirmed!',
          html: `
            <h1>Hi ${member.name},</h1>
            <p>Your team, <strong>${parsed.data.teamName}</strong>, has been successfully registered for the hackathon!</p>
            <p><strong>Project Title:</strong> ${parsed.data.projectTitle}</p>
            <p>We're excited to have you on board. We'll be in touch with more information soon.</p>
            <br/>
            <p>Best of luck!</p>
            <p>The Hackathon Organizers</p>
          `,
        });
      });
      await Promise.all(emailPromises);
    } catch (emailError) {
      console.error('Failed to send one or more confirmation emails:', emailError);
    }
    return NextResponse.json(
      { message: 'Registration successful!', registrationId: newRegistration._id },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}
