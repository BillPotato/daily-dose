"use client";

import FeelingAnalyzer from "@/components/FeelingAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function FeelingAnalyzerPage() {
  const router = useRouter();
  const { isDark } = useTheme();

  useAuthGuard();

  return (
    <div
      className={`min-h-screen py-8 theme-transition ${
        isDark ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-blue-50/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <button
            onClick={() => router.push("/dashboard")}
            className={`inline-flex items-center space-x-2 mb-6 transition-all duration-300 hover:scale-105 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border ${
              isDark
                ? "text-gray-400 hover:text-white bg-gray-800/80 border-gray-700 hover:border-gray-500"
                : "text-gray-600 hover:text-gray-900 bg-white/80 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>

          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Feeling Analyzer
            </h1>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Describe how you&apos;re feeling and get personalized health insights and
              recommendations
            </p>
          </div>
        </div>

        <FeelingAnalyzer />
      </div>
    </div>
  );
}
