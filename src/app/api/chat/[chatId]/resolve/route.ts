import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EXPERT") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const chatRoom = await db.chatRoom.findUnique({
      where: { id: parseInt(chatId) },
    });

    if (!chatRoom || chatRoom.expertId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedChatRoom = await db.chatRoom.update({
      where: { id: parseInt(chatId) },
      data: { status: "RESOLVED" },
    });

    return NextResponse.json(updatedChatRoom);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
