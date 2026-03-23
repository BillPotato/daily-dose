"use client";

import FeelingAnalyzer from "@/components/FeelingAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import type { Task } from "@/types";

export default function FeelingAnalyzerPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  const handleTasksGenerated = (newTasks: Task[]) => {
    if (!newTasks || newTasks.length === 0) return;

    const rawStoredTasks = localStorage.getItem("tasks");
    let existingTasks: Task[] = [];

    try {
      const parsed = JSON.parse(rawStoredTasks || "[]");
      existingTasks = Array.isArray(parsed) ? parsed : [];
    } catch {
      existingTasks = [];
    }

    const updatedTasks = [...(existingTasks || []), ...newTasks];
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  useAuthGuard();

  return (
    <div
      className={`min-h-screen py-8 theme-transition ${
        isDark ? "bg-stone-950" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <button
            onClick={() => router.push("/")}
            className={`inline-flex items-center space-x-2 mb-6 transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl shadow-sm border ${
              isDark
                ? "text-stone-300 hover:text-stone-100 bg-stone-900 border-stone-700 hover:border-stone-500"
                : "text-stone-600 hover:text-emerald-900 bg-white border-stone-200 hover:border-stone-300"
            }`}
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>

          <div className="text-center">
            <h1 className="text-5xl font-semibold text-emerald-950 dark:text-[#F1F3F2] mb-4">
              Feeling Analyzer
            </h1>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-stone-300" : "text-stone-600"
              }`}
            >
              Describe how you&apos;re feeling and get personalized health insights and
              recommendations
            </p>
          </div>
        </div>

        <FeelingAnalyzer onTasksGenerated={handleTasksGenerated} />
      </div>
    </div>
  );
}
