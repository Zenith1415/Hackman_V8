import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FoodLog from '@/models/FoodLog';
import mongoose from 'mongoose'; // <-- 1. Import mongoose

// 2. Define an interface for the data returned by .lean()
interface IFoodLog {
  _id: mongoose.Types.ObjectId;
  name: string;
  teamName: string;
  teamId: string;
  attendance: boolean;
  hadBreakfast: boolean;
  hadLunch: boolean;
  hadDinner: boolean;
  hadSnacks: boolean;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ teamCode: string }> }
) {
  try {
    const params = await context.params;
    const { teamCode } = params;

    if (!teamCode) {
      return NextResponse.json(
        { message: 'Team code is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Specify the type <IFoodLog> for the .lean() call
    const members = await FoodLog.find({ teamId: teamCode }).lean<IFoodLog[]>();

    if (!members || members.length === 0) {
      return NextResponse.json(
        { message: 'No members found for this team code' },
        { status: 404 }
      );
    }

    // 3. Apply the type to the 'member' variable
    const membersData = members.map((member: IFoodLog) => ({
      ...member,
      _id: member._id.toString(), // <-- This line will no longer error
    }));

    return NextResponse.json(membersData, { status: 200 });
  } catch (error: unknown) { // <-- Also fixed the 'any' type error here
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