"use client";

import { useState, useEffect } from "react";
import { TaskQueueItem } from "@/lib/taskQueue";

interface TaskQueueStats {
  total: number;
  neverAttempted: number;
  attemptedNotSolved: number;
  dueForReview: number;
  overdue: number;
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface TaskQueueResponse {
  taskQueue: TaskQueueItem[];
  stats: TaskQueueStats;
}

export default function TaskQueue() {
  const [data, setData] = useState<TaskQueueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskQueue();
  }, []);

  const fetchTaskQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/task-queue");
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load task queue");
      }
    } catch (err) {
      console.error("Error fetching task queue:", err);
      setError("Failed to load task queue");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "medium": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "hard": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getReasonColor = (reason: string) => {
    if (reason.includes("overdue")) {
      return "text-red-600 dark:text-red-400";
    } else if (reason.includes("Due for review")) {
      return "text-orange-600 dark:text-orange-400";
    } else if (reason.includes("not solved")) {
      return "text-yellow-600 dark:text-yellow-400";
    } else if (reason.includes("Never attempted")) {
      return "text-blue-600 dark:text-blue-400";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchTaskQueue}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No task queue data available
      </div>
    );
  }

  const { taskQueue, stats } = data;

  if (taskQueue.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          All caught up!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No problems need your attention right now. Great work!
        </p>
        <button
          onClick={fetchTaskQueue}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Queue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.attemptedNotSolved}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Attempted</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.neverAttempted}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">New</div>
        </div>
      </div>

      {/* Task Queue Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Task Queue
        </h2>
        <button
          onClick={fetchTaskQueue}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {taskQueue.slice(0, 20).map((task, index) => (
          <div
            key={task.problem.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {task.problem.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.problem.difficulty)}`}>
                    {task.problem.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{task.problem.topicName}</span>
                  {task.solvedCount > 0 && (
                    <span>Solved {task.solvedCount} time{task.solvedCount !== 1 ? 's' : ''}</span>
                  )}
                  {task.lastAttempt && (
                    <span>Last: {formatTimeSpent(task.lastAttempt.timeSpent)}</span>
                  )}
                </div>
                
                <div className={`text-sm font-medium ${getReasonColor(task.reason)}`}>
                  {task.reason}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <a
                  href={task.problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Solve
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {taskQueue.length > 20 && (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400">
            Showing top 20 tasks. {taskQueue.length - 20} more in queue.
          </p>
        </div>
      )}
    </div>
  );
}
