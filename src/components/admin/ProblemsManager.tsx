"use client";

import { useState, useEffect } from "react";

interface Topic {
  id: string;
  name: string;
}

interface Problem {
  id: string;
  title: string;
  url: string;
  status: string;
  topicId: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  topicName?: string;
}

interface NewProblem {
  title: string;
  url: string;
  topicId: string;
  difficulty: string;
}

export default function ProblemsManager() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [newProblem, setNewProblem] = useState<NewProblem>({
    title: "",
    url: "",
    topicId: "",
    difficulty: "easy",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch topics and problems in parallel
      const [topicsResponse, problemsResponse] = await Promise.all([
        fetch("/api/admin/topics"),
        fetch("/api/admin/problems")
      ]);

      if (topicsResponse.ok && problemsResponse.ok) {
        const [topicsData, problemsData] = await Promise.all([
          topicsResponse.json(),
          problemsResponse.json()
        ]);
        
        setTopics(topicsData);
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

  const handleCreateProblem = async () => {
    if (!newProblem.title.trim() || !newProblem.url.trim() || !newProblem.topicId) {
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProblem),
      });

      if (response.ok) {
        const createdProblem = await response.json();
        setProblems([...problems, createdProblem]);
        setNewProblem({
          title: "",
          url: "",
          topicId: "",
          difficulty: "easy",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create problem");
      }
    } catch (error) {
      console.error("Error creating problem:", error);
      alert("Failed to create problem");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProblem = async (problem: Problem) => {
    try {
      const response = await fetch(`/api/admin/problems/${problem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: problem.title,
          url: problem.url,
          topicId: problem.topicId,
          difficulty: problem.difficulty,
        }),
      });

      if (response.ok) {
        const updatedProblem = await response.json();
        setProblems(problems.map(p => p.id === problem.id ? updatedProblem : p));
        setEditingProblem(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update problem");
      }
    } catch (error) {
      console.error("Error updating problem:", error);
      alert("Failed to update problem");
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm("Are you sure you want to delete this problem? This will also delete all associated attempts and notes.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProblems(problems.filter(p => p.id !== problemId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete problem");
      }
    } catch (error) {
      console.error("Error deleting problem:", error);
      alert("Failed to delete problem");
    }
  };

  const getTopicName = (topicId: string) => {
    return topics.find(t => t.id === topicId)?.name || "Unknown Topic";
  };

  if (loading) {
    return <div className="text-center">Loading problems...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Problem */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Create New Problem
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Problem Title
            </label>
            <input
              type="text"
              value={newProblem.title}
              onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
              placeholder="e.g., Two Sum"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LeetCode URL
            </label>
            <input
              type="url"
              value={newProblem.url}
              onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
              placeholder="https://leetcode.com/problems/..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic
            </label>
            <select
              value={newProblem.topicId}
              onChange={(e) => setNewProblem({ ...newProblem, topicId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty
            </label>
            <select
              value={newProblem.difficulty}
              onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleCreateProblem}
            disabled={!newProblem.title.trim() || !newProblem.url.trim() || !newProblem.topicId || isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Problem"}
          </button>
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Existing Problems ({problems.length})
        </h3>
        
        {problems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No problems found. Create your first problem above.
          </p>
        ) : (
          <div className="space-y-4">
            {problems.map((problem) => (
              <div
                key={problem.id}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                {editingProblem?.id === problem.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingProblem.title}
                          onChange={(e) =>
                            setEditingProblem({ ...editingProblem, title: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          URL
                        </label>
                        <input
                          type="url"
                          value={editingProblem.url}
                          onChange={(e) =>
                            setEditingProblem({ ...editingProblem, url: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Topic
                        </label>
                        <select
                          value={editingProblem.topicId}
                          onChange={(e) =>
                            setEditingProblem({ ...editingProblem, topicId: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                              {topic.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Difficulty
                        </label>
                        <select
                          value={editingProblem.difficulty}
                          onChange={(e) =>
                            setEditingProblem({ ...editingProblem, difficulty: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateProblem(editingProblem)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingProblem(null)}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {problem.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {problem.topicName || getTopicName(problem.topicId)} • {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </p>
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                      >
                        View on LeetCode ↗
                      </a>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        ID: {problem.id}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingProblem(problem)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(problem.id)}
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
