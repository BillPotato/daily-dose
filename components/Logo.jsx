"use client";

import { useTheme } from "@/contexts/ThemeContext";

const Logo = ({ size = 'medium' }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex items-center space-x-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-50 relative">
        <img
          src="/dailydose.png"
          alt="Daily Dose Logo"
          className="w-full h-full object-cover transform scale-150 translate-y-1" // More zoom and moved down
        />
      </div>

      <div className="flex flex-col">
        <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          DAILY DOSE
        </span>
        <span className={`text-xs opacity-75 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Fuel Your Best Day
        </span>
      </div>
    </div>
  );
};

export default Logo;
