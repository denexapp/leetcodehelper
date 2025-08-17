"use client";

import { useState, useEffect } from "react";

interface Problem {
  id: string;
  title: string;
  url: string;
  difficulty: string;
  topicName: string;
}

interface Attempt {
  id: string;
  problemId: string;
  date: string;
  solvedSolo: boolean;
  timeSpent: number;
  createdAt: string;
  updatedAt: string;
  problemTitle: string;
  problemUrl: string;
  problemDifficulty: string;
  topicName: string;
}

interface NewAttempt {
  problemId: string;
  date: string;
  solvedSolo: boolean;
  timeSpent: number;
}

export default function AttemptsManager() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAttempt, setEditingAttempt] = useState<Attempt | null>(null);
  const [newAttempt, setNewAttempt] = useState<NewAttempt>({
    problemId: "",
    date: new Date().toISOString().split('T')[0], // Today's date
    solvedSolo: true,
    timeSpent: 30,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch attempts and problems in parallel
      const [attemptsResponse, problemsResponse] = await Promise.all([
        fetch("/api/attempts"),
        fetch("/api/problems")
      ]);

      if (attemptsResponse.ok && problemsResponse.ok) {
        const [attemptsData, problemsData] = await Promise.all([
          attemptsResponse.json(),
          problemsResponse.json()
        ]);
        
        setAttempts(attemptsData);
        setProblems(problemsData);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttempt = async () => {
    if (!newAttempt.problemId || !newAttempt.date || newAttempt.timeSpent <= 0) {
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAttempt),
      });

      if (response.ok) {
        const createdAttempt = await response.json();
        setAttempts([...attempts, createdAttempt]);
        setNewAttempt({
          problemId: "",
          date: new Date().toISOString().split('T')[0],
          solvedSolo: true,
          timeSpent: 30,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create attempt");
      }
    } catch (error) {
      console.error("Error creating attempt:", error);
      alert("Failed to create attempt");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAttempt = async (attempt: Attempt) => {
    try {
      const response = await fetch(`/api/attempts/${attempt.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: attempt.problemId,
          date: attempt.date,
          solvedSolo: attempt.solvedSolo,
          timeSpent: attempt.timeSpent,
        }),
      });

      if (response.ok) {
        const updatedAttempt = await response.json();
        setAttempts(attempts.map(a => a.id === attempt.id ? updatedAttempt : a));
        setEditingAttempt(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update attempt");
      }
    } catch (error) {
      console.error("Error updating attempt:", error);
      alert("Failed to update attempt");
    }
  };

  const handleDeleteAttempt = async (attemptId: string) => {
    if (!confirm("Are you sure you want to delete this attempt?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/attempts/${attemptId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAttempts(attempts.filter(a => a.id !== attemptId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete attempt");
      }
    } catch (error) {
      console.error("Error deleting attempt:", error);
      alert("Failed to delete attempt");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 dark:text-green-400";
      case "medium": return "text-yellow-600 dark:text-yellow-400";
      case "hard": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return <div className="text-center">Loading attempts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Attempt */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Record New Attempt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Problem
            </label>
            <select
              value={newAttempt.problemId}
              onChange={(e) => setNewAttempt({ ...newAttempt, problemId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a problem</option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.topicName} - {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={newAttempt.date}
              onChange={(e) => setNewAttempt({ ...newAttempt, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Spent (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={newAttempt.timeSpent}
              onChange={(e) => setNewAttempt({ ...newAttempt, timeSpent: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Solved Solo?
            </label>
            <select
              value={newAttempt.solvedSolo.toString()}
              onChange={(e) => setNewAttempt({ ...newAttempt, solvedSolo: e.target.value === "true" })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="true">Yes, solved solo</option>
              <option value="false">No, needed help</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleCreateAttempt}
            disabled={!newAttempt.problemId || !newAttempt.date || newAttempt.timeSpent <= 0 || isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Recording..." : "Record Attempt"}
          </button>
        </div>
      </div>

      {/* Attempts List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          My Attempts ({attempts.length})
        </h3>
        
        {attempts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No attempts recorded yet. Record your first attempt above!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                {editingAttempt?.id === attempt.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Problem
                        </label>
                        <select
                          value={editingAttempt.problemId}
                          onChange={(e) =>
                            setEditingAttempt({ ...editingAttempt, problemId: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {problems.map((problem) => (
                            <option key={problem.id} value={problem.id}>
                              {problem.topicName} - {problem.title} ({problem.difficulty})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editingAttempt.date.split('T')[0]}
                          onChange={(e) =>
                            setEditingAttempt({ ...editingAttempt, date: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time Spent (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={editingAttempt.timeSpent}
                          onChange={(e) =>
                            setEditingAttempt({ ...editingAttempt, timeSpent: parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Solved Solo?
                        </label>
                        <select
                          value={editingAttempt.solvedSolo.toString()}
                          onChange={(e) =>
                            setEditingAttempt({ ...editingAttempt, solvedSolo: e.target.value === "true" })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="true">Yes, solved solo</option>
                          <option value="false">No, needed help</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateAttempt(editingAttempt)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingAttempt(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {attempt.problemTitle}
                        </h4>
                        <span className={`text-sm font-medium ${getDifficultyColor(attempt.problemDifficulty)}`}>
                          {attempt.problemDifficulty.charAt(0).toUpperCase() + attempt.problemDifficulty.slice(1)}
                        </span>
                        {attempt.solvedSolo && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Solo
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {attempt.topicName} • {formatDate(attempt.date)} • {formatTimeSpent(attempt.timeSpent)}
                      </p>
                      
                      <a
                        href={attempt.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                      >
                        View Problem ↗
                      </a>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingAttempt(attempt)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAttempt(attempt.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
