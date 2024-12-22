import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";

const commentSchema = z.object({
  content: z.string().nonempty("Comment cannot be empty"),
  threadId: z.number(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, threadId } = commentSchema.parse(body);

    const comment = await db.forumComment.create({
      data: {
        content,
        threadId,
        authorId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(
      { message: "Comment added successfully", comment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
