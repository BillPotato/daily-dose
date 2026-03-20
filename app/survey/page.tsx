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
          ? "bg-stone-950"
          : "bg-transparent"
      }`}
    >
      <Survey />
    </div>
  );
}
