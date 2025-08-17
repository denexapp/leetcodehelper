import getRequiredSession from "@/lib/auth/getRequiredSession";
import TaskQueue from "@/components/TaskQueue";

export default async function Home() {
  await getRequiredSession();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            LeetCode Helper
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your personalized problem-solving task queue with spaced repetition.
          </p>
        </div>

        <TaskQueue />
      </div>
    </div>
  );
}
