import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { problems, topics } from "@/lib/db/schemas/leetcode";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/admin/problems - Get all problems with topic information
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allProblems = await db
      .select({
        id: problems.id,
        title: problems.title,
        url: problems.url,
        status: problems.status,
        topicId: problems.topicId,
        difficulty: problems.difficulty,
        createdAt: problems.createdAt,
        updatedAt: problems.updatedAt,
        topicName: topics.name,
      })
      .from(problems)
      .leftJoin(topics, eq(problems.topicId, topics.id))
      .orderBy(problems.createdAt);
    
    return NextResponse.json(allProblems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

// POST /api/admin/problems - Create a new problem
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, url, topicId, difficulty } = await request.json();

    // Validation
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Problem title is required" },
        { status: 400 }
      );
    }

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { error: "Problem URL is required" },
        { status: 400 }
      );
    }

    if (!topicId || typeof topicId !== "string") {
      return NextResponse.json(
        { error: "Topic ID is required" },
        { status: 400 }
      );
    }

    if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Valid difficulty is required (easy, medium, hard)" },
        { status: 400 }
      );
    }

    // Verify topic exists
    const topic = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId))
      .limit(1);

    if (topic.length === 0) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    const problemId = `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newProblem = {
      id: problemId,
      title: title.trim(),
      url: url.trim(),
      status: "not_started",
      topicId,
      difficulty,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(problems).values(newProblem);

    // Return the problem with topic name
    const createdProblem = await db
      .select({
        id: problems.id,
        title: problems.title,
        url: problems.url,
        status: problems.status,
        topicId: problems.topicId,
        difficulty: problems.difficulty,
        createdAt: problems.createdAt,
        updatedAt: problems.updatedAt,
        topicName: topics.name,
      })
      .from(problems)
      .leftJoin(topics, eq(problems.topicId, topics.id))
      .where(eq(problems.id, problemId))
      .limit(1);

    return NextResponse.json(createdProblem[0], { status: 201 });
  } catch (error) {
    console.error("Error creating problem:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "A problem with this URL already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}
