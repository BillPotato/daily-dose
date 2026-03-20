"use client";

import { useTheme } from "@/contexts/ThemeContext";

const Logo = ({ size = 'medium' }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex items-center space-x-3 ${isDark ? 'text-stone-100' : 'text-emerald-950'}`}>
      <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-200 bg-white relative">
        <img
          src="/dailydose.png"
          alt="Daily Dose Logo"
          className="w-full h-full object-cover transform scale-150 translate-y-1" // More zoom and moved down
        />
      </div>

      <div className="flex flex-col">
        <span className="font-serif font-semibold text-lg text-emerald-900">
          DAILY DOSE
        </span>
        <span className={`text-xs opacity-80 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
          Fuel Your Best Day
        </span>
      </div>
    </div>
  );
};

export default Logo;
