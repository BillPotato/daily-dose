"use client";

import MedicationParser from "@/components/MedicationParser";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task } from "@/types";

export default function MedicationParserPage() {
  const { isDark } = useTheme();
  useAuthGuard();

  const handleSave = (parsedTasks: Task[]) => {
    const parsed = JSON.parse(localStorage.getItem("tasks") || "[]");
    const existingTasks: Task[] = Array.isArray(parsed) ? parsed : [];
    const updatedTasks = [...parsedTasks, ...existingTasks];
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <div
      className={`min-h-screen theme-transition ${
        isDark ? "bg-stone-950" : "bg-transparent"
      }`}
    >
      <MedicationParser onSave={handleSave} />
    </div>
  );
}
