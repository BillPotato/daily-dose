"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTheme } from "@/contexts/ThemeContext";

type Task = Record<string, any>;

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useAuthGuard();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("tasks") || "[]");
      setTasks(stored);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task,
    );
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div
      className={`min-h-screen p-4 theme-transition ${
        isDark
          ? "bg-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <Dashboard
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
