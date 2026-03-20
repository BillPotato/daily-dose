"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();
  const user =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/signin');
  };

  // Don't show header on auth pages
  if (pathname.startsWith('/auth')) {
    return null;
  }

  return (
    <header className={`
      sticky top-0 z-50 
      ${isDark
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700'
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
      }
      transition-all duration-300
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-4 group"
          >
            <Logo size="medium" />
          </button>

          {/* Right: User info and controls */}
          <div className="flex items-center space-x-4">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Welcome, {user.name || 'User'}
            </span>
            <a
              href="https://github.com/BillPotato/daily-dose"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center space-x-2 rounded-xl px-3 py-2 transition-all duration-300 ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-label="View source code on GitHub"
              title="GitHub Repository"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.49 2 12.02c0 4.43 2.87 8.19 6.84 9.52.5.09.68-.22.68-.48 0-.24-.01-1.03-.01-1.87-2.78.61-3.37-1.2-3.37-1.2-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.61.07-.61 1 .07 1.52 1.03 1.52 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.96 0-1.1.39-2 1.03-2.71-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.03A9.5 9.5 0 0112 6.84c.85 0 1.71.11 2.51.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.41.1 2.66.64.71 1.03 1.61 1.03 2.71 0 3.86-2.34 4.71-4.57 4.96.36.31.68.92.68 1.85 0 1.34-.01 2.41-.01 2.74 0 .27.18.58.69.48A10.02 10.02 0 0022 12.02C22 6.49 17.52 2 12 2z" />
              </svg>
              <span className="hidden md:inline">Source</span>
            </a>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all duration-300
                ${isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                }
                hover:shadow-lg transform hover:scale-105
              `}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
