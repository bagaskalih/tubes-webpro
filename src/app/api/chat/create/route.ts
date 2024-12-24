import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { expertId } = body;

    // Check if there's an existing active chat room
    const existingChatRoom = await db.chatRoom.findFirst({
      where: {
        userId: parseInt(session.user.id),
        expertId: expertId,
        status: "ACTIVE",
      },
    });

    if (existingChatRoom) {
      return NextResponse.json({ chatRoomId: existingChatRoom.id });
    }

    // Create new chat room
    const chatRoom = await db.chatRoom.create({
      data: {
        userId: parseInt(session.user.id),
        expertId: expertId,
      },
    });

    return NextResponse.json({ chatRoomId: chatRoom.id });
  } catch (error) {
    console.error("Error creating chat room:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
