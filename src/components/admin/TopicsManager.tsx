"use client";

import { useState, useEffect } from "react";

interface Topic {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function TopicsManager() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [newTopicName, setNewTopicName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch topics from API
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch("/api/admin/topics");
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      } else {
        console.error("Failed to fetch topics");
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTopicName }),
      });

      if (response.ok) {
        const newTopic = await response.json();
        setTopics([...topics, newTopic]);
        setNewTopicName("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create topic");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      alert("Failed to create topic");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTopic = async (topic: Topic) => {
    try {
      const response = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: topic.name }),
      });

      if (response.ok) {
        const updatedTopic = await response.json();
        setTopics(topics.map(t => t.id === topic.id ? updatedTopic : t));
        setEditingTopic(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update topic");
      }
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Failed to update topic");
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic? This will also delete all associated problems.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTopics(topics.filter(t => t.id !== topicId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete topic");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      alert("Failed to delete topic");
    }
  };

  if (loading) {
    return <div className="text-center">Loading topics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create New Topic */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Create New Topic
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="Topic name (e.g., Arrays, Trees)"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            onKeyDown={(e) => e.key === "Enter" && handleCreateTopic()}
          />
          <button
            onClick={handleCreateTopic}
            disabled={!newTopicName.trim() || isCreating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Topic"}
          </button>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Existing Topics ({topics.length})
        </h3>
        
        {topics.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No topics found. Create your first topic above.
          </p>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                {editingTopic?.id === topic.id ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      value={editingTopic.name}
                      onChange={(e) =>
                        setEditingTopic({ ...editingTopic, name: e.target.value })
                      }
                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateTopic(editingTopic);
                        if (e.key === "Escape") setEditingTopic(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateTopic(editingTopic)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTopic(null)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {topic.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {topic.id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTopic(topic)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
