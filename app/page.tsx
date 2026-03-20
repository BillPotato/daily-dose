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

// TODO: Fix first access does not display dashboard properly
// TODO: Fix first feeling-analyzer generate fails
// TODO: Add sample data to the initial chart