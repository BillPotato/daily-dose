"use client";

import Survey from "@/components/Survey";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SurveyPage() {
  const { isDark } = useTheme();
  useAuthGuard();

  return (
    <div
      className={`min-h-screen theme-transition ${
        isDark
          ? "bg-slate-900"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      }`}
    >
      <Survey />
    </div>
  );
}
