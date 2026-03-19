"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem("token");
    router.replace(isAuthenticated ? "/dashboard" : "/auth/signin");
  }, [router]);

  return <main className="min-h-screen bg-slate-100" />;
}
