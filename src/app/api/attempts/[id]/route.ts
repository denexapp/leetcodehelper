import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { attempts, problems, topics } from "@/lib/db/schemas/leetcode";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PUT /api/attempts/[id] - Update an attempt (only if it belongs to the current user)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { problemId, date, solvedSolo, timeSpent } = await request.json();

    // Validation
    if (!problemId || typeof problemId !== "string") {
      return NextResponse.json(
        { error: "Problem ID is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    if (typeof solvedSolo !== "boolean") {
      return NextResponse.json(
        { error: "Solved solo must be true or false" },
        { status: 400 }
      );
    }

    if (!timeSpent || typeof timeSpent !== "number" || timeSpent < 0) {
      return NextResponse.json(
        { error: "Time spent must be a positive number" },
        { status: 400 }
      );
    }

    // Verify problem exists
    const problem = await db
      .select()
      .from(problems)
      .where(eq(problems.id, problemId))
      .limit(1);

    if (problem.length === 0) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Update only if the attempt belongs to the current user
    const updatedAttempt = await db
      .update(attempts)
      .set({
        problemId,
        date: new Date(date),
        solvedSolo,
        timeSpent,
        updatedAt: new Date(),
      })
      .where(and(
        eq(attempts.id, id),
        eq(attempts.userId, session.user.id)
      ))
      .returning();

    if (updatedAttempt.length === 0) {
      return NextResponse.json({ error: "Attempt not found or access denied" }, { status: 404 });
    }

    // Return the attempt with problem information
    const attemptWithInfo = await db
      .select({
        id: attempts.id,
        problemId: attempts.problemId,
        date: attempts.date,
        solvedSolo: attempts.solvedSolo,
        timeSpent: attempts.timeSpent,
        createdAt: attempts.createdAt,
        updatedAt: attempts.updatedAt,
        problemTitle: problems.title,
        problemUrl: problems.url,
        problemDifficulty: problems.difficulty,
        topicName: topics.name,
      })
      .from(attempts)
      .leftJoin(problems, eq(attempts.problemId, problems.id))
      .leftJoin(topics, eq(problems.topicId, topics.id))
      .where(eq(attempts.id, id))
      .limit(1);

    return NextResponse.json(attemptWithInfo[0]);
  } catch (error) {
    console.error("Error updating attempt:", error);
    return NextResponse.json(
      { error: "Failed to update attempt" },
      { status: 500 }
    );
  }
}

// DELETE /api/attempts/[id] - Delete an attempt (only if it belongs to the current user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete only if the attempt belongs to the current user
    const deletedAttempt = await db
      .delete(attempts)
      .where(and(
        eq(attempts.id, id),
        eq(attempts.userId, session.user.id)
      ))
      .returning();

    if (deletedAttempt.length === 0) {
      return NextResponse.json({ error: "Attempt not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attempt:", error);
    return NextResponse.json(
      { error: "Failed to delete attempt" },
      { status: 500 }
    );
  }
}
