"use client";

export default function TaskCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-white/15 dark:bg-[#252A27]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/3 rounded-md bg-stone-200 dark:bg-[#2F3632]" />
          <div className="h-3.5 w-full rounded-md bg-stone-200 dark:bg-[#2F3632]" />
          <div className="h-3.5 w-5/6 rounded-md bg-stone-200 dark:bg-[#2F3632]" />
        </div>
        <div className="h-9 w-24 rounded-lg bg-stone-200 dark:bg-[#2F3632]" />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-6 w-20 rounded-full bg-stone-200 dark:bg-[#2F3632]" />
        <div className="h-6 w-16 rounded-full bg-stone-200 dark:bg-[#2F3632]" />
      </div>
    </div>
  );
}
