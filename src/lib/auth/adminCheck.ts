import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schemas/auth";
import { eq } from "drizzle-orm";

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin(): Promise<{
  isAdmin: boolean;
  user: { id: string; name: string; email: string; isAdmin: boolean } | null;
  session: { user: { id: string } } | null;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return { isAdmin: false, user: null, session: null };
    }

    // Get user from database to check admin status
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (user.length === 0) {
      return { isAdmin: false, user: null, session };
    }

    return {
      isAdmin: user[0].isAdmin,
      user: user[0],
      session,
    };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { isAdmin: false, user: null, session: null };
  }
}

/**
 * Require admin access or throw unauthorized error
 */
export async function requireAdmin() {
  const { isAdmin, user, session } = await checkIsAdmin();
  
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  
  if (!isAdmin) {
    throw new Error("FORBIDDEN");
  }
  
  return { user, session };
}
