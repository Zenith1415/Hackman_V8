import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect'; // Using path alias
import Registration from '../../../../models/Registration'; // Using path alias
import { handleError } from '../../../../lib/errorUtils'; // Import the new handler

// Your interfaces can remain the same
interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
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
    
    const newRegistration = await Registration.create(data);

    return NextResponse.json(
      { message: 'Registration successful!', registrationId: newRegistration._id },
      { status: 201 }
    );

  } catch (error: unknown) {
    // The entire complex catch block is replaced by this one line!
    return handleError(error);
  }
}