import dbConnect  from "../../../../lib/dbConnect";
import Category from "../../../../models/Category";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  // fetch all categories
  const categories = await Category.find({}, { _id: 1, name: 1 }).sort({ name: 1 });

  return NextResponse.json(categories);
}
