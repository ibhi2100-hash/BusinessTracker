import Brand from "@/models/Brand";
import dbConnect  from "../../../../lib/dbConnect";
import Item from "../../../../models/Item";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if(!categoryId) {
        return NextResponse.json([], { status: 400 });
    }

    const brands = await Brand.find({ category: categoryId }).sort("name");
    return NextResponse.json(brands);
}