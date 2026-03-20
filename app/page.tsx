"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTheme } from "@/contexts/ThemeContext";

export default function HomePage() {
  const [tasks, setTasks] = useState<Record<string, any>[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { isDark } = useTheme();

  useAuthGuard();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem("tasks") || "[]");
      setTasks(stored);
    } catch {
      setTasks([]);
    }
  }, [isMounted]);

  const handleUpdateTask = (updatedTask: Record<string, any>) => {
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

  if (!isMounted) {
    return (
      <div className="min-h-screen p-8 animate-pulse">
        <div className="max-w-7xl mx-auto text-sm text-gray-500 dark:text-gray-400">
          Loading dashboard...
        </div>
      </div>
    );
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
// TODO: Fix first feeling-analyzer generate fails
// TODO: Fix survey duplicate questions
// TODO: Add sample data to the initial chart