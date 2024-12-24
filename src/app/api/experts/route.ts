import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const experts = await db.user.findMany({
      where: {
        role: "EXPERT",
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        about: true,
        profileImage: true,
        rating: true,
        totalReviews: true,
      },
    });

    return NextResponse.json({ experts });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
