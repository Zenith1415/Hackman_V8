import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Registration from '../../../../models/Registration';
import { handleError } from '../../../../lib/errorUtils';
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    if (!email) {
      return NextResponse.json({ message: 'Team lead email is required' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: 'Team lead phone number is required' }, { status: 400 });
    }
    const team = await Registration.findOne({
      $expr: {
        $and: [
          { $eq: [ { $toLower: { $arrayElemAt: [ "$members.email", "$teamLeadId" ] } }, email.trim().toLowerCase() ] },
          { $eq: [ { $arrayElemAt: [ "$members.phone", "$teamLeadId" ] }, phone.trim() ] }
        ]
      }
    }).select('-__v');
    if (team) {
      return NextResponse.json(team, { status: 200 });
    }
    return NextResponse.json({ message: 'Team not found or invalid credentials' }, { status: 404 });
  } catch (error: unknown) {
    return handleError(error);
  }
}
