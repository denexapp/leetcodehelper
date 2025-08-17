import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { problems, topics, attempts } from "@/lib/db/schemas/leetcode";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getActiveTaskQueue, getQueueStats } from "@/lib/taskQueue";

// GET /api/task-queue - Get prioritized task queue for current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all problems with topic information
    const allProblems = await db
      .select({
        id: problems.id,
        title: problems.title,
        url: problems.url,
        difficulty: problems.difficulty,
        topicName: topics.name,
      })
      .from(problems)
      .leftJoin(topics, eq(problems.topicId, topics.id))
      .orderBy(problems.id);

    // Fetch user's attempts
    const userAttempts = await db
      .select({
        id: attempts.id,
        problemId: attempts.problemId,
        date: attempts.date,
        solvedSolo: attempts.solvedSolo,
        timeSpent: attempts.timeSpent,
      })
      .from(attempts)
      .where(eq(attempts.userId, session.user.id));

    // Convert and type the data for the algorithm
    const problemsForAlgorithm = allProblems.map(p => ({
      id: p.id,
      title: p.title,
      url: p.url,
      difficulty: p.difficulty as 'easy' | 'medium' | 'hard',
      topicName: p.topicName || 'Unknown',
    }));

    const attemptsForAlgorithm = userAttempts.map(attempt => ({
      ...attempt,
      date: attempt.date.toISOString(),
    }));

    // Generate task queue
    const taskQueue = getActiveTaskQueue(problemsForAlgorithm, attemptsForAlgorithm);
    const stats = getQueueStats(taskQueue);

    return NextResponse.json({
      taskQueue,
      stats,
    });
  } catch (error) {
    console.error("Error generating task queue:", error);
    return NextResponse.json(
      { error: "Failed to generate task queue" },
      { status: 500 }
    );
  }
}
