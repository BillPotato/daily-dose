"use client";

import SignIn from "@/components/auth/SignIn";

export default function SignInPage() {
  return (
    <div className="min-h-screen theme-transition bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
