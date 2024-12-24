// src/app/api/user/settings/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import * as z from "zod";

const updateProfileSchema = z.object({
  name: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password minimal 8 karakter").optional(),
  profileImage: z.string().optional(),
});

interface ProfileUpdateFields {
  name?: string;
  profileImage?: string;
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword, profileImage } =
      updateProfileSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const passwordMatch = await compare(currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { message: "Password saat ini tidak sesuai" },
          { status: 400 }
        );
      }
      const hashedPassword = await hash(newPassword, 10);
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    // Handle profile update
    const updateData: ProfileUpdateFields = {};
    if (name) updateData.name = name;
    if (profileImage) updateData.profileImage = profileImage;

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Profile berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui profil" },
      { status: 500 }
    );
  }
}
