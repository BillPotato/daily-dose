"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import TaskCardSkeleton from "@/components/ui/TaskCardSkeleton";
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
      setTasks(Array.isArray(stored) ? stored : []);
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
      <div
        className={`min-h-screen p-4 theme-transition ${
          isDark
            ? "bg-slate-900"
            : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 h-8 w-56 rounded-md bg-gray-200 dark:bg-slate-700" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <TaskCardSkeleton key={`task-skeleton-${index}`} />
            ))}
          </div>
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

// TODO: Fix survey duplicate questions
// TODO: Add sample data to the initial chart
// TODO: Add github source on navbar