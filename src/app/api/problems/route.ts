import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { problems, topics } from "@/lib/db/schemas/leetcode";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/problems - Get all problems for selection
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
        difficulty: problems.difficulty,
        topicName: topics.name,
      })
      .from(problems)
      .leftJoin(topics, eq(problems.topicId, topics.id))
      .orderBy(topics.name, problems.title);
    
    return NextResponse.json(allProblems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
