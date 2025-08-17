import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { problems, topics } from "@/lib/db/schemas/leetcode";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PUT /api/admin/problems/[id] - Update a problem
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updatedProblem = await db
      .update(problems)
      .set({
        title: title.trim(),
        url: url.trim(),
        topicId,
        difficulty,
        updatedAt: new Date(),
      })
      .where(eq(problems.id, params.id))
      .returning();

    if (updatedProblem.length === 0) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Return the problem with topic name
    const problemWithTopic = await db
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
      .where(eq(problems.id, params.id))
      .limit(1);

    return NextResponse.json(problemWithTopic[0]);
  } catch (error) {
    console.error("Error updating problem:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "A problem with this URL already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/problems/[id] - Delete a problem
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedProblem = await db
      .delete(problems)
      .where(eq(problems.id, params.id))
      .returning();

    if (deletedProblem.length === 0) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
}
