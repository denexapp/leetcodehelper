"use client";

import { useState } from "react";
import { TaskQueueItem } from "@/lib/taskQueue";

interface QuickAttemptModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskQueueItem;
  onAttemptAdded: () => void;
}

interface NewAttempt {
  problemId: string;
  date: string;
  solvedSolo: boolean;
  timeSpent: number;
}

export default function QuickAttemptModal({ 
  isOpen, 
  onClose, 
  task, 
  onAttemptAdded 
}: QuickAttemptModalProps) {
  const [attempt, setAttempt] = useState<NewAttempt>({
    problemId: task.problem.id,
    date: new Date().toISOString().split('T')[0], // Today's date
    solvedSolo: true,
    timeSpent: 30,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attempt.date || attempt.timeSpent <= 0) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attempt),
      });

      if (response.ok) {
        // Reset form
        setAttempt({
          problemId: task.problem.id,
          date: new Date().toISOString().split('T')[0],
          solvedSolo: true,
          timeSpent: 30,
        });
        onAttemptAdded();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to record attempt");
      }
    } catch (err) {
      console.error("Error creating attempt:", err);
      setError("Failed to record attempt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 dark:text-green-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "hard": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Record Attempt
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {task.problem.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Problem Info */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-3">
              <span className={`font-medium ${getDifficultyColor(task.problem.difficulty)}`}>
                {task.problem.difficulty.charAt(0).toUpperCase() + task.problem.difficulty.slice(1)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {task.problem.topicName}
              </span>
            </div>
            {task.solvedCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Previously solved {task.solvedCount} time{task.solvedCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={attempt.date}
                onChange={(e) => setAttempt({ ...attempt, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Spent (minutes)
              </label>
              <div className="flex gap-2">
                {[15, 30, 45, 60, 90].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setAttempt({ ...attempt, timeSpent: minutes })}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      attempt.timeSpent === minutes
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                value={attempt.timeSpent}
                onChange={(e) => setAttempt({ ...attempt, timeSpent: parseInt(e.target.value) || 0 })}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Custom time in minutes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Result
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="solvedSolo"
                    checked={attempt.solvedSolo === true}
                    onChange={() => setAttempt({ ...attempt, solvedSolo: true })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    ✅ Solved it solo
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="solvedSolo"
                    checked={attempt.solvedSolo === false}
                    onChange={() => setAttempt({ ...attempt, solvedSolo: false })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-900 dark:text-white">
                    🤔 Needed help or didn&apos;t solve
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !attempt.date || attempt.timeSpent <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? "Recording..." : "Record Attempt"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
