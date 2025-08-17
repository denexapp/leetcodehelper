import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { attempts, problems, topics } from "@/lib/db/schemas/leetcode";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/attempts - Get all attempts for the current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAttempts = await db
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
      .where(eq(attempts.userId, session.user.id))
      .orderBy(attempts.date);
    
    return NextResponse.json(userAttempts);
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}

// POST /api/attempts - Create a new attempt
export async function POST(request: NextRequest) {
  try {
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

    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newAttempt = {
      id: attemptId,
      problemId,
      date: new Date(date),
      userId: session.user.id,
      solvedSolo,
      timeSpent,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(attempts).values(newAttempt);

    // Return the attempt with problem information
    const createdAttempt = await db
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
      .where(eq(attempts.id, attemptId))
      .limit(1);

    return NextResponse.json(createdAttempt[0], { status: 201 });
  } catch (error) {
    console.error("Error creating attempt:", error);
    return NextResponse.json(
      { error: "Failed to create attempt" },
      { status: 500 }
    );
  }
}
