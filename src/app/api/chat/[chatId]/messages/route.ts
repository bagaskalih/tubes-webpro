import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    const chatRoom = await db.chatRoom.findUnique({
      where: { id: parseInt(chatId) },
      include: {
        expert: {
          select: {
            name: true,
            image: true,
          },
        },
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    if (!chatRoom) {
      return NextResponse.json({ message: "Chat not found" }, { status: 404 });
    }

    // Verify user has access to this chat
    const userId = parseInt(session.user.id);
    if (chatRoom.userId !== userId && chatRoom.expertId !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const messages = await db.message.findMany({
      where: { chatRoomId: parseInt(chatId) },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Check if there's a review when the chat is resolved
    const hasReview =
      chatRoom.status === "RESOLVED"
        ? await db.review.findUnique({
            where: { chatRoomId: parseInt(chatId) },
          })
        : null;

    return NextResponse.json({
      messages,
      chatRoom,
      hasReview: !!hasReview,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    const chatRoom = await db.chatRoom.findUnique({
      where: { id: parseInt(chatId) },
    });

    if (!chatRoom || chatRoom.status === "RESOLVED") {
      return NextResponse.json(
        { message: "Chat not found or resolved" },
        { status: 404 }
      );
    }

    const userId = parseInt(session.user.id);
    if (chatRoom.userId !== userId && chatRoom.expertId !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    const receiverId =
      userId === chatRoom.userId ? chatRoom.expertId : chatRoom.userId;

    const message = await db.message.create({
      data: {
        content,
        senderId: userId,
        receiverId,
        chatRoomId: parseInt(chatId),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
