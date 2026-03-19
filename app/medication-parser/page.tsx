"use client";

import MedicationParser from "@/components/MedicationParser";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTheme } from "@/contexts/ThemeContext";

export default function MedicationParserPage() {
  const { isDark } = useTheme();
  useAuthGuard();

  const handleSave = (parsedTasks: any[]) => {
    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const updatedTasks = [...parsedTasks, ...existingTasks];
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  return (
    <div
      className={`min-h-screen theme-transition ${
        isDark ? "bg-slate-900" : "bg-gradient-to-br from-gray-50 to-blue-50/30"
      }`}
    >
      <MedicationParser onSave={handleSave} />
    </div>
  );
}
