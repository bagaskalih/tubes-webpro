import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";
import { Prisma } from "@prisma/client";
import { Category } from "@/types/forum";

const threadSchema = z.object({
  title: z.string().nonempty("Title cannot be empty"),
  content: z.string().nonempty("Content cannot be empty"),
  category: z.nativeEnum(Category),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category } = threadSchema.parse(body);

    const thread = await db.thread.create({
      data: {
        title,
        content,
        category,
        authorId: parseInt(session.user.id),
      },
    });

    return NextResponse.json(
      { message: "Thread created successfully", thread },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("category");

    const whereClause: Prisma.ThreadWhereInput =
      categoryParam &&
      Object.values(Category).includes(categoryParam as Category)
        ? { category: categoryParam as Category }
        : {};

    const threads = await db.thread.findMany({
      include: {
        author: {
          select: {
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ threads });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
