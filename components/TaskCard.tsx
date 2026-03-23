"use client";

import { generateGoogleCalendarUrl } from '@/lib/googleCalendarUrl';
import { useTheme } from '@/contexts/ThemeContext';
import type { Task } from '@/types';

export type TaskCardProps = {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onRemindLater?: (taskId: string) => void;
  isTimeForMedication?: boolean;
  nextReminderTime?: string;
  showActionButtons?: boolean;
  compact?: boolean;
};

/**
 * Reusable task card component for displaying tasks uniformly
 */
export default function TaskCard({
  task,
  onUpdate,
  onDelete,
  onRemindLater,
  isTimeForMedication = false,
  nextReminderTime = '',
  showActionButtons = true,
  compact = false,
}: TaskCardProps) {
  const { isDark } = useTheme();

  const getTaskIcon = () => {
    if (task.type === 'supplement') return '🌿';
    if (task.type === 'health-task') return '🏥';
    return '💊';
  };

  const getFrequencyColor = (frequency?: string) => {
    const colors: Record<string, string> = {
      'once-daily': isDark ? 'bg-emerald-900/35 text-emerald-200' : 'bg-emerald-100 text-emerald-800',
      'twice-daily': isDark ? 'bg-emerald-800/40 text-emerald-100' : 'bg-emerald-50 text-emerald-900',
      'three-times-daily': isDark ? 'bg-stone-700/70 text-stone-200' : 'bg-stone-200 text-stone-800',
      'daily': isDark ? 'bg-emerald-900/35 text-emerald-200' : 'bg-emerald-100 text-emerald-800',
    };
    return colors[frequency || ''] || (isDark ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-800');
  };

  const generateCalendarLinkForTask = () => {
    const time = nextReminderTime || task.times?.[0] || '08:00';
    const now = new Date();

    // If start/end are already from Gemini response
    if (task.start && task.end) {
      return generateGoogleCalendarUrl({
        title: `${getTaskIcon()} ${task.title}`,
        description: task.description || '',
        location: task.location || '',
        start: task.start,
        end: task.end,
      });
    }

    // Otherwise generate from time
    const [hours, minutes] = time.split(':').map(Number);
    const start = new Date(now);
    start.setHours(hours, minutes, 0, 0);

    if (start < now) {
      start.setDate(start.getDate() + 1);
    }

    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return generateGoogleCalendarUrl({
      title: `${getTaskIcon()} ${task.title}`,
      description: task.description || '',
      location: task.location || '',
      start,
      end,
    });
  };

  const handleMarkComplete = () => {
    if (onUpdate) {
      onUpdate({
        ...task,
        completed: [
          ...(task.completed || []),
          {
            timestamp: new Date().toISOString(),
            date: new Date().toDateString(),
          },
        ],
      });
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  if (compact) {
    // Compact view for generated tasks
    return (
      <article className={`relative overflow-hidden rounded-[2rem] p-8 transition-all ${isDark ? 'bg-[#252A27] border border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]' : 'bg-white border border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]'}`}>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getTaskIcon()}</span>
              <h4 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                {task.title}
              </h4>
            </div>
            {task.description && (
              <p className={`max-w-2xl text-base ${isDark ? 'text-[#D9DDDC]' : 'text-stone-600'}`}>
                {task.description}
              </p>
            )}
            {task.frequency && (
              <span className={`inline-flex rounded-full px-4 py-2 text-xs ${getFrequencyColor(task.frequency)}`}>
                {task.frequency.replace(/-/g, ' ')}
              </span>
            )}
          </div>
          <a
            href={generateCalendarLinkForTask()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-lg"
            title="Add to Google Calendar"
          >
            <span aria-hidden="true">🍃</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
            </svg>
            <span>Add to Calendar</span>
          </a>
        </div>
      </article>
    );
  }

  // Full view for active tracking
  return (
    <article
      className={`relative overflow-hidden rounded-[2rem] p-8 transition-all ${
        isTimeForMedication
          ? isDark
            ? 'border border-emerald-500/70 bg-[#2D332F] ring-2 ring-emerald-500/40 animate-pulse'
            : 'bg-white border border-stone-200 ring-2 ring-emerald-300 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]'
          : isDark
            ? 'border border-white/15 bg-[#252A27] shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]'
            : 'bg-white border border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]'
      }`}
    >
      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getTaskIcon()}</span>
              <h4 className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                {task.title}
              </h4>
            </div>

            {task.description && (
              <p className={`max-w-3xl text-base leading-relaxed ${isDark ? 'text-[#D9DDDC]' : 'text-stone-600'}`}>
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {nextReminderTime && (
                <span className={`rounded-full px-4 py-2 text-sm ${isDark ? 'bg-stone-700 text-stone-200' : 'bg-emerald-50 text-emerald-900'}`}>
                  Next reminder: {nextReminderTime}
                </span>
              )}
              {task.frequency && (
                <span className={`rounded-full px-4 py-2 text-xs ${getFrequencyColor(task.frequency)}`}>
                  {task.frequency.replace(/-/g, ' ')}
                </span>
              )}
              {isTimeForMedication && (
                <span className={`rounded-full px-4 py-2 text-sm animate-pulse ${isDark ? 'bg-emerald-900/35 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`}>
                  Time to take now
                </span>
              )}
            </div>
          </div>

          {showActionButtons && (
            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              {onRemindLater && (
                <button
                  onClick={() => onRemindLater(task.id)}
                  className="rounded-full bg-stone-700 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-stone-600 hover:shadow-lg"
                >
                  Remind Later
                </button>
              )}
              <a
                href={generateCalendarLinkForTask()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-lg"
                title="Add to Google Calendar"
              >
                <span aria-hidden="true">🍃</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                </svg>
                <span>Add to Calendar</span>
              </a>
              {onUpdate && (
                <button
                  onClick={handleMarkComplete}
                  className="rounded-full bg-emerald-700 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-800 hover:shadow-lg"
                >
                  Mark Complete
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="rounded-full bg-stone-800 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-stone-700 hover:shadow-lg"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {task.times && task.times.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-medium ${isDark ? 'text-[#D9DDDC]' : 'text-stone-600'}`}>Times:</span>
            {task.times.map((time, index) => (
              <span
                key={index}
                className={`rounded-full px-3 py-1 text-xs ${
                  time === nextReminderTime
                    ? isDark
                      ? 'bg-emerald-900/40 text-emerald-200 font-medium'
                      : 'bg-emerald-100 text-emerald-800 font-medium'
                    : isDark
                      ? 'bg-stone-700 text-stone-200'
                      : 'bg-stone-100 text-stone-700'
                }`}
              >
                {time}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
