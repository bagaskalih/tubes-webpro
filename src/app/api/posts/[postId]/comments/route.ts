import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";

const commentSchema = z.object({
  content: z.string().nonempty("Komentar tidak boleh kosong"),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = commentSchema.parse(body);
    const { postId } = await params;

    const comment = await db.comment.create({
      data: {
        content,
        authorId: parseInt(session.user.id),
        postId: parseInt(postId),
      },
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
