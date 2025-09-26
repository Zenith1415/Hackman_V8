import { NextResponse } from 'next/server';

import dbConnect from '../../../../lib/dbConnect';
import Registration from '../../../../models/Registration';
import { handleError } from '../../../../lib/errorUtils.js';
import { z } from 'zod';
import nodemailer from 'nodemailer';


interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;

  usn?: string;
  linkedin?: string;
  github?: string;
}

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

    await dbConnect();

    const data: RegistrationData = await request.json();

    const teamMemberSchema = z.object({
      id: z.number(),
      name: z.string().trim().min(1, 'Member name is required'),
      email: z.string().trim().email('Invalid member email'),
      phone: z
        .string()
        .trim()
        .regex(/^\d{10}$/i, 'Phone must contain exactly 10 digits'),
      usn: z
        .string()
        .trim()
        .regex(/^1[a-z]{2}2[1-5][a-z]{2}\d{3}$/i, 'USN must match 1 + 2 letters + 21-25 + 2 letters + 3 digits'),
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
        teamName: z.string().trim().min(1, 'Team name is required'),
        collegeName: z.string().trim().min(1, 'College name is required'),
        projectTitle: z.string().trim().min(1, 'Project title is required'),
        projectDescription: z
          .string()
          .trim()
          .min(1, 'Project description is required')
          .max(500, 'Project description must be at most 500 characters'),
        teamLeadId: z.number().nullable(),
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
        if (teamLeadId === null) return false;
        return members.some((m) => m.id === teamLeadId);
      }, {
        message: 'teamLeadId must refer to one of the members',
        path: ['teamLeadId'],
      });

    const parsed = registrationSchema.safeParse(data);
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
    
    const newRegistration = await Registration.create(parsed.data);
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
          `
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

    const data: RegistrationData = await request.json();

    if (!data.teamName || !data.collegeName || data.members.length < 2 || data.members.length > 4) {
      return NextResponse.json(
        { message: 'Validation failed: Invalid team name or member count.' },
        { status: 400 }
      );
    }
    

    
    

    return NextResponse.json(
      { message: 'Registration successful!', data: data },
      { status: 201 } 
    );

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'An error occurred on the server.' },
      { status: 500 } 

  }
}
