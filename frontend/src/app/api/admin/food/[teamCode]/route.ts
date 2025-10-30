import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FoodLog from '@/models/FoodLog';
// mongoose not needed here since FoodLog uses string _id

function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const expected = process.env.ADMIN_TOKEN || '';
  return Boolean(expected) && token === expected;
}

// 2. Define an interface for the data returned by .lean()
interface IFoodLog {
  _id: string;
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
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
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

    // Data already has string _id; return as-is
    return NextResponse.json(members, { status: 200 });
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