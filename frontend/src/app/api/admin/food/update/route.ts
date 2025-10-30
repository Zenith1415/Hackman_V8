import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FoodLog from '@/models/FoodLog';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const { docId, field, status } = await request.json();

    if (!docId || !field || typeof status !== 'boolean') {
      return NextResponse.json(
        { message: 'Missing required fields: docId, field, status' },
        { status: 400 }
      );
    }

    await dbConnect();

    let result;
    try {
      result = await FoodLog.updateOne(
        { _id: new mongoose.Types.ObjectId(docId) },
        { [field]: status }
      );
    } catch (castError) {
      console.warn('Casting to ObjectId failed, trying string match...');
      result = await FoodLog.updateOne(
        { _id: docId },
        { [field]: status }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Status updated successfully' },
      { status: 200 }
    );
  } catch (error: unknown) { // <-- Fix 4: Use unknown
    let message = 'Internal server error';
    if (error instanceof Error) {
      message = error.message;
    }
    console.error('API Error:', error);
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 }
    );
  }
}