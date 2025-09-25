import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect.js';
import Registration from '../../../../models/Registration.js';

// Interfaces for type safety (good practice!)
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
  // The try...catch block handles any unexpected errors during the process.
  try {
    // STEP 1: Connect to the database.
    // Our helper function ensures we use a cached connection if available.
    await dbConnect();

    // STEP 2: Parse the data from the frontend.
    const data: RegistrationData = await request.json();

    // STEP 3: Use the Mongoose Model to create a new document.
    // The .create() method takes the JS object, validates it against the schema,
    // and saves it to MongoDB if it's valid.
    const newRegistration = await Registration.create(data);

    // STEP 4: Send a success response back to the frontend.
    // We include the unique ID (_id) of the document that was just created.
    return NextResponse.json(
      { message: 'Registration successful!', registrationId: newRegistration._id },
      { status: 201 } // 201 means "Created"
    );

  } catch (unknownError: unknown) {
    console.error('API Error:', unknownError);

    // Type guards for common Mongo/Mongoose error shapes
    const isDuplicateKeyError = (e: unknown): e is { code: number } =>
      typeof e === 'object' && e !== null && 'code' in e && typeof (e as { code: unknown }).code === 'number';

    const isValidationError = (
      e: unknown,
    ): e is { name: string; errors: Record<string, { message?: unknown }> } => {
      if (typeof e !== 'object' || e === null) return false;
      const maybe = e as { name?: unknown; errors?: unknown };
      return (
        maybe.name === 'ValidationError' &&
        typeof maybe.errors === 'object' &&
        maybe.errors !== null
      );
    };

    // STEP 5: Handle specific errors gracefully.
    // If the error code is 11000, it's a duplicate key error (teamName is unique).
    if (isDuplicateKeyError(unknownError) && unknownError.code === 11000) {
      return NextResponse.json(
        { message: 'A team with this name already exists.' },
        { status: 400 } // 400 means "Bad Request"
      );
    }
    
    // If it's a Mongoose validation error, compile the error messages.
    if (isValidationError(unknownError)) {
        const messages = Object.values(unknownError.errors).map((val) =>
          typeof val === 'object' && val !== null && 'message' in val && typeof val.message === 'string'
            ? val.message
            : 'Validation error'
        );
        return NextResponse.json(
            { message: `Validation failed: ${messages.join(', ')}` },
            { status: 400 }
        );
    }

    // For any other kind of error, send a generic server error message.
    return NextResponse.json(
      { message: 'An error occurred on the server.' },
      { status: 500 }
    );
  }
}