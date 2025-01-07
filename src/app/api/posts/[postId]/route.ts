import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const id = parseInt(postId);
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            role: true,
            specialty: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                name: true,
                role: true,
                specialty: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!post) {
      return notFound();
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to get post:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
