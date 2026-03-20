"use client";

import { generateGoogleCalendarUrl } from '@/lib/googleCalendarUrl';
import { useTheme } from '@/contexts/ThemeContext';

export type TaskCardProps = {
  task: {
    id: string;
    title: string;
    description?: string;
    location?: string;
    frequency?: string;
    type?: string;
    times?: string[];
    start?: string;
    end?: string;
    source?: string;
    [key: string]: any;
  };
  onUpdate?: (task: any) => void;
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
      'once-daily': isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
      'twice-daily': isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800',
      'three-times-daily': isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800',
      'daily': isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800',
    };
    return colors[frequency || ''] || (isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800');
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
      <div className={`p-4 rounded-xl border transition-all ${isDark ? 'bg-gray-700/50 border-gray-600 hover:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-300'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTaskIcon()}</span>
              <div className="flex-1">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            {task.frequency && (
              <div className="mt-3">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getFrequencyColor(task.frequency)}`}>
                  {task.frequency.replace(/-/g, ' ')}
                </span>
              </div>
            )}
          </div>
          <a
            href={generateCalendarLinkForTask()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
            title="Add to Google Calendar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
            </svg>
            <span>Add</span>
          </a>
        </div>
      </div>
    );
  }

  // Full view for active tracking
  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isTimeForMedication
          ? isDark
            ? 'border-orange-500 bg-orange-900/20 animate-pulse'
            : 'border-orange-400 bg-orange-50 animate-pulse'
          : isDark
            ? 'border-gray-600 bg-gray-700/50'
            : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">{getTaskIcon()}</div>
          <div>
            <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              {nextReminderTime && (
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Next: {nextReminderTime}
                </span>
              )}
              {task.frequency && (
                <span className={`px-2 py-1 text-xs rounded-full ${getFrequencyColor(task.frequency)}`}>
                  {task.frequency.replace(/-/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {showActionButtons && (
          <div className="flex items-center space-x-2">
            {isTimeForMedication && (
              <span className={`px-3 py-1 text-sm rounded-full animate-pulse ${isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800'}`}>
                Time to take!
              </span>
            )}
            {onRemindLater && (
              <button
                onClick={() => onRemindLater(task.id)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Remind Later
              </button>
            )}
            <a
              href={generateCalendarLinkForTask()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              title="Add to Google Calendar"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
              </svg>
              <span>Calendar</span>
            </a>
            {onUpdate && (
              <button
                onClick={handleMarkComplete}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Mark Complete
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {task.times && task.times.length > 0 && (
        <div className="flex items-center space-x-2 mt-3">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Times:</span>
          {task.times.map((time, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs rounded ${
                time === nextReminderTime
                  ? isDark
                    ? 'bg-blue-900/30 text-blue-300 font-medium'
                    : 'bg-blue-100 text-blue-800 font-medium'
                  : isDark
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {time}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
