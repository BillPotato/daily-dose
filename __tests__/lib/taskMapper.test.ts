import {
  mapGeminiTaskToAppTask,
  mapGeminiTasksToAppTasks,
  type GeminiTask,
} from "@/lib/taskMapper";

describe("taskMapper", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse("2026-04-07T12:34:56.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("maps a Gemini task to an app task", () => {
    const expectedDefaultTime = new Date("2026-04-07T15:30:00.000Z").toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    );

    const geminiTask: GeminiTask = {
      summary: "Take medication",
      description: "Take with food",
      location: "Home",
      start: {
        dateTime: "2026-04-07T15:30:00.000Z",
        timeZone: "UTC",
      },
      end: {
        dateTime: "2026-04-07T16:30:00.000Z",
        timeZone: "UTC",
      },
    };

    const result = mapGeminiTaskToAppTask(geminiTask, 2);

    expect(result).toEqual({
      id: "gemini-1775565296000-2",
      title: "Take medication",
      description: "Take with food",
      location: "Home",
      frequency: "daily",
      type: "health-task",
      defaultTime: expectedDefaultTime,
      times: [expectedDefaultTime],
      completed: [],
      createdAt: "2026-04-07T12:34:56.000Z",
      isActive: true,
      parsed: false,
      start: "2026-04-07T15:30:00.000Z",
      end: "2026-04-07T16:30:00.000Z",
      source: "gemini-ai",
    });
  });

  it("defaults missing optional fields to empty strings", () => {
    const expectedDefaultTime = new Date("2026-04-07T08:05:00.000Z").toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    );

    const geminiTask: GeminiTask = {
      summary: "Check blood pressure",
      description: "",
      start: {
        dateTime: "2026-04-07T08:05:00.000Z",
      },
      end: {
        dateTime: "2026-04-07T08:35:00.000Z",
      },
    };

    const result = mapGeminiTaskToAppTask(geminiTask, 0);

    expect(result.location).toBe("");
    expect(result.description).toBe("");
    expect(result.defaultTime).toBe(expectedDefaultTime);
    expect(result.times).toEqual([expectedDefaultTime]);
    expect(result.parsed).toBe(false);
  });

  it("maps multiple tasks in order and preserves empty arrays", () => {
    const geminiTasks: GeminiTask[] = [
      {
        summary: "Morning walk",
        description: "",
        start: { dateTime: "2026-04-07T07:00:00.000Z" },
        end: { dateTime: "2026-04-07T07:30:00.000Z" },
      },
      {
        summary: "Evening stretch",
        description: "",
        location: "Living room",
        start: { dateTime: "2026-04-07T18:00:00.000Z" },
        end: { dateTime: "2026-04-07T18:15:00.000Z" },
      },
    ];

    const result = mapGeminiTasksToAppTasks(geminiTasks);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("gemini-1775565296000-0");
    expect(result[1].id).toBe("gemini-1775565296000-1");
    expect(result[0].title).toBe("Morning walk");
    expect(result[1].location).toBe("Living room");
    expect(mapGeminiTasksToAppTasks([])).toEqual([]);
  });
});