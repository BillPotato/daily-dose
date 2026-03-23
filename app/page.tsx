"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import TaskCardSkeleton from "@/components/ui/TaskCardSkeleton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task } from "@/types";

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  if (!isMounted) {
    return (
      <div
        className={`min-h-screen p-4 theme-transition ${
          isDark
            ? "bg-stone-950"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-2 py-6 sm:px-4 sm:py-10">
          <div className="mb-6 h-8 w-56 rounded-md bg-stone-200 dark:bg-[#2A312D]" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          ? "bg-stone-950"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-2 py-6 sm:px-4 sm:py-10">
        <Dashboard
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}