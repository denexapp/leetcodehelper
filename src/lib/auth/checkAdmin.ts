import getSession from "@/lib/auth/getSession";
import { db } from "@/lib/db/db";
import { users } from "@/lib/db/schemas/auth";
import { eq } from "drizzle-orm";

export default async function checkAdmin(): Promise<boolean> {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return false;
    }

    const user = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then(result => result[0]);

    return user?.isAdmin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
