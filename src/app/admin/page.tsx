import { Suspense } from "react";
import getSession from "@/lib/auth/getSession";
import { redirect } from "next/navigation";
import TopicsManager from "@/components/admin/TopicsManager";
import ProblemsManager from "@/components/admin/ProblemsManager";

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/unauthorized");
  }

  // TODO: Add admin role check here when roles are implemented
  // For now, any authenticated user can access admin

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage topics and problems for the LeetCode Helper application.
          </p>
        </div>

        <div className="space-y-8">
          {/* Topics Management Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Topics Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, edit, and delete problem topics/categories.
              </p>
            </div>
            <div className="p-6">
              <Suspense fallback={<div>Loading topics...</div>}>
                <TopicsManager />
              </Suspense>
            </div>
          </div>

          {/* Problems Management Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Problems Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create, edit, and delete LeetCode problems.
              </p>
            </div>
            <div className="p-6">
              <Suspense fallback={<div>Loading problems...</div>}>
                <ProblemsManager />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
