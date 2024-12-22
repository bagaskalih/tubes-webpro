import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type } = body; // "LIKE" or "DISLIKE"

    const { commentId } = await params;
    const existingLike = await db.forumLike.findUnique({
      where: {
        userId_commentId: {
          userId: parseInt(session.user.id),
          commentId: parseInt(commentId),
        },
      },
    });

    if (existingLike) {
      if (existingLike.type === type) {
        await db.forumLike.delete({
          where: { id: existingLike.id },
        });
        return NextResponse.json({ message: "Like removed" });
      } else {
        await db.forumLike.update({
          where: { id: existingLike.id },
          data: { type },
        });
        return NextResponse.json({ message: "Like updated" });
      }
    }

    await db.forumLike.create({
      data: {
        type,
        userId: parseInt(session.user.id),
        commentId: parseInt(commentId),
      },
    });

    return NextResponse.json({ message: "Like added successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
