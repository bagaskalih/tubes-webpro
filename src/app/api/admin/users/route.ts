import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import * as z from "zod";
import { Role } from "@prisma/client"; // Import the Role enum from Prisma

const userSchema = z.object({
  name: z.string().nonempty("Nama tidak boleh kosong"),
  email: z
    .string()
    .email("Email tidak valid")
    .nonempty("Email tidak boleh kosong"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["EXPERT", "USER"] as const), // Explicitly type the enum values
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized - Not an admin" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, password, role } = userSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // console.error(role);

    // Create user with explicit role casting
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized - No session" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized - Not an admin" },
        { status: 401 }
      );
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      where: {
        role: {
          in: [Role.USER, Role.EXPERT], // Use the Role enum from Prisma
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
