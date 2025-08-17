import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { topics } from "@/lib/db/schemas/leetcode";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PUT /api/admin/topics/[id] - Update a topic
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

    const { name } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Topic name is required" },
        { status: 400 }
      );
    }

    const updatedTopic = await db
      .update(topics)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(topics.id, id))
      .returning();

    if (updatedTopic.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTopic[0]);
  } catch (error) {
    console.error("Error updating topic:", error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "A topic with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/topics/[id] - Delete a topic
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

    const deletedTopic = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning();

    if (deletedTopic.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
