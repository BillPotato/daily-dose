import { fireEvent, render, screen } from "@testing-library/react";
import TaskCard from "@/components/TaskCard";
import type { Task } from "@/types";

const mockGenerateGoogleCalendarUrl = jest.fn(() => "https://calendar.google.com/mock");

jest.mock("@/lib/googleCalendarUrl", () => ({
  generateGoogleCalendarUrl: (...args: unknown[]) => mockGenerateGoogleCalendarUrl(...args),
}));

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

const baseTask: Task = {
  id: "task-1",
  title: "Take Vitamin D",
  description: "With breakfast",
  location: "Kitchen",
  frequency: "once-daily",
  type: "medication",
  defaultTime: "08:00",
  times: ["08:00", "20:00"],
  completed: [],
  createdAt: "2026-04-07T10:00:00.000Z",
  isActive: true,
  parsed: false,
  start: "2026-04-08T08:00:00.000Z",
  end: "2026-04-08T09:00:00.000Z",
  source: "gemini-ai",
};

describe("TaskCard", () => {
  beforeEach(() => {
    mockGenerateGoogleCalendarUrl.mockClear();
  });

  it("renders task details and reminder data", () => {
    render(
      <TaskCard
        task={baseTask}
        nextReminderTime="08:00"
        isTimeForMedication
      />,
    );

    expect(screen.getByText("Take Vitamin D")).toBeInTheDocument();
    expect(screen.getByText("With breakfast")).toBeInTheDocument();
    expect(screen.getByText("once daily")).toBeInTheDocument();
    expect(screen.getByText("Next reminder: 08:00")).toBeInTheDocument();
    expect(screen.getByText("Time to take now")).toBeInTheDocument();
    expect(screen.getAllByText("08:00").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /add to calendar/i })).toHaveAttribute(
      "href",
      "https://calendar.google.com/mock",
    );
  });

  it("triggers action handlers from buttons", () => {
    const onRemindLater = jest.fn();
    const onDelete = jest.fn();
    const onUpdate = jest.fn();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <TaskCard
        task={baseTask}
        onRemindLater={onRemindLater}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remind Later" }));
    fireEvent.click(screen.getByRole("button", { name: "Mark Complete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onRemindLater).toHaveBeenCalledWith("task-1");
    expect(onDelete).toHaveBeenCalledWith("task-1");
    expect(onUpdate).toHaveBeenCalledTimes(1);

    const updatedTask = onUpdate.mock.calls[0][0] as Task;
    expect(updatedTask.completed).toHaveLength(1);
    expect(updatedTask.completed[0]).toHaveProperty("timestamp");
    expect(updatedTask.completed[0]).toHaveProperty("date");

    confirmSpy.mockRestore();
  });

  it("renders compact mode without full action buttons", () => {
    render(<TaskCard task={baseTask} compact />);

    expect(screen.queryByRole("button", { name: "Remind Later" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mark Complete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add to calendar/i })).toBeInTheDocument();
  });
});