import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import * as z from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ayvqagtjtkhriqwynupc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dnFhZ3RqdGtocmlxd3ludXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTk3NjUsImV4cCI6MjA0OTY5NTc2NX0.aDbCCeWvxbQtHxDv9FbZaj7pyQL0wZ017aoBKcRBYLc"
);

const updatePostSchema = z.object({
  title: z.string().nonempty("Judul tidak boleh kosong"),
  content: z.string().nonempty("Konten tidak boleh kosong"),
  image: z.string().optional(),
});

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

    const body = await req.json();
    const validatedData = updatePostSchema.parse(body);
    const id = parseInt(postId);

    // Get the existing post to check if we need to delete an old image
    const existingPost = await db.post.findUnique({
      where: { id },
      select: { image: true },
    });

    // If there's an existing image and it's different from the new one,
    // delete the old image from storage
    if (existingPost?.image && existingPost.image !== validatedData.image) {
      try {
        const oldImageKey = existingPost.image.split("/").pop();
        if (oldImageKey) {
          await supabase.storage.from("artikel-images").remove([oldImageKey]);
        }
      } catch (error) {
        console.error("Failed to delete old image:", error);
        // Continue with the update even if image deletion fails
      }
    }

    const post = await db.post.update({
      where: { id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        image: validatedData.image,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

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

    // Get the post to check if there's an image to delete
    const post = await db.post.findUnique({
      where: { id },
      select: { image: true },
    });

    // If the post has an image, delete it from storage
    if (post?.image) {
      try {
        const imageKey = post.image.split("/").pop();
        if (imageKey) {
          await supabase.storage.from("artikel-images").remove([imageKey]);
        }
      } catch (error) {
        console.error("Failed to delete image:", error);
        // Continue with post deletion even if image deletion fails
      }
    }

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
