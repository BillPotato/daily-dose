/**
 * Maps AI-generated Gemini tasks to the application's task structure
 */

export type GeminiTask = {
  summary: string;
  description: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
};

export type AppTask = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  frequency: string;
  type: string;
  defaultTime?: string;
  times?: string[];
  completed: {
    timestamp: string;
    date: string;
  }[];
  createdAt: string;
  isActive: boolean;
  parsed: boolean;
  start?: string;
  end?: string;
  source?: string;
};

/**
 * Converts a Gemini task to the application's task format
 */
export function mapGeminiTaskToAppTask(geminiTask: GeminiTask, index: number): AppTask {
  const startDateTime = new Date(geminiTask.start.dateTime);
  const startTime = startDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    id: `gemini-${Date.now()}-${index}`,
    title: geminiTask.summary,
    description: geminiTask.description || '',
    location: geminiTask.location || '',
    frequency: 'daily', // Default frequency for AI-generated tasks
    type: 'health-task', // Mark as AI-generated
    defaultTime: startTime,
    times: [startTime],
    completed: [],
    createdAt: new Date().toISOString(),
    isActive: true,
    parsed: false, // This is AI-generated, not manually parsed
    start: geminiTask.start.dateTime,
    end: geminiTask.end.dateTime,
    source: 'gemini-ai', // Track origin
  };
}

/**
 * Converts an array of Gemini tasks to the application's task format
 */
export function mapGeminiTasksToAppTasks(geminiTasks: GeminiTask[]): AppTask[] {
  return geminiTasks.map((task, index) => mapGeminiTaskToAppTask(task, index));
}
