"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

export default function Footer() {
  const pathname = usePathname();
  const { isDark } = useTheme();

  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <footer
      className={`mt-auto border-t py-8 text-sm ${
        isDark
          ? "border-gray-700 text-gray-400"
          : "border-gray-200 text-gray-500"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
        <p className="font-medium">Built by Bill Nguyen.</p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link href="https://github.com/BillPotato" className="hover:text-blue-500 transition-colors">
            Github
          </Link>
          <Link href="https://www.linkedin.com/in/phuc-bao-nguyen/" className="hover:text-blue-500 transition-colors">
            LinkedIn
          </Link>
        </div>

        <p>
          &copy; {new Date().getFullYear()} Daily Dose. Powered by Next.js &amp;
          {" "}
          Vercel.
        </p>
      </div>
    </footer>
  );
}
