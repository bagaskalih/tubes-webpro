import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const thread = await db.thread.findUnique({
      where: { id: parseInt(threadId) },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                name: true,
                role: true,
              },
            },
            _count: {
              select: {
                likes: {
                  where: { type: "LIKE" },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { message: "Thread not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ thread });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.thread.delete({
      where: { id: parseInt(threadId) },
    });

    return NextResponse.json({ message: "Thread deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
