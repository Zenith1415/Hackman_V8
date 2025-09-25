import { NextResponse } from 'next/server';

// Type guard to check for Mongoose duplicate key errors
export function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 11000
  );
}

// Type guard to check for Mongoose validation errors
export function isValidationError(error: unknown): error is { name: string; errors: Record<string, { message: string }> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: unknown }).name === 'ValidationError'
  );
}

// A generic error handler function to reduce boilerplate in the catch block
export function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (isDuplicateKeyError(error)) {
    return NextResponse.json(
      { message: 'A team with this name already exists.' },
      { status: 400 }
    );
  }
  
  if (isValidationError(error)) {
    const messages = Object.values(error.errors).map((err) => err.message);
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