import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const whereClause =
      session.user.role === "EXPERT"
        ? { expertId: userId }
        : { userId: userId };

    const chatRooms = await db.chatRoom.findMany({
      where: whereClause,
      include: {
        expert: {
          select: {
            name: true,
            profileImage: true,
          },
        },
        user: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ chatRooms });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
