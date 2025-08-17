import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { topics } from "@/lib/db/schemas/leetcode";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/admin/topics - Get all topics
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allTopics = await db.select().from(topics).orderBy(topics.createdAt);
    
    return NextResponse.json(allTopics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}

// POST /api/admin/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Topic name is required" },
        { status: 400 }
      );
    }

    const topicId = `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const newTopic = {
      id: topicId,
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(topics).values(newTopic);

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "A topic with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
