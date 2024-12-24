import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;
    const chatRoom = await db.chatRoom.findUnique({
      where: { id: parseInt(chatId) },
    });

    if (!chatRoom || chatRoom.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { rating, comment } = await req.json();

    // Start a transaction to handle the review creation and expert rating update
    const review = await db.$transaction(async (tx) => {
      // Create the review
      const review = await tx.review.create({
        data: {
          rating,
          comment,
          userId: parseInt(session.user.id),
          expertId: chatRoom.expertId,
          chatRoomId: parseInt(chatId),
        },
      });

      // Get current expert data
      const expert = await tx.user.findUnique({
        where: { id: chatRoom.expertId },
        select: { rating: true, totalRatings: true },
      });

      // Calculate new rating
      const currentTotalRating =
        (expert?.rating || 0) * (expert?.totalRatings || 0);
      const newTotalRatings = (expert?.totalRatings || 0) + 1;
      const newRating = (currentTotalRating + rating) / newTotalRatings;

      // Update expert's rating
      await tx.user.update({
        where: { id: chatRoom.expertId },
        data: {
          rating: newRating,
          totalRatings: newTotalRatings,
          totalReviews: { increment: 1 },
        },
      });

      return review;
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
