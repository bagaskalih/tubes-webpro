import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EXPERT"].includes(session.user?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content, image } = await req.json();
    const id = parseInt(postId);

    const post = await db.post.update({
      where: { id },
      data: {
        title,
        content,
        image,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EXPERT"].includes(session.user?.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(postId);
    await db.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
