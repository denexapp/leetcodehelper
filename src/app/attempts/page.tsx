import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AttemptsManager from "@/components/attempts/AttemptsManager";

export default async function AttemptsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Attempts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your LeetCode problem solving attempts and progress.
          </p>
        </div>

        <AttemptsManager />
      </div>
    </div>
  );
}
