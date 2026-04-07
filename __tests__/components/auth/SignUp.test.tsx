import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUp from "@/components/auth/SignUp";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe("SignUp", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    pushMock.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows validation error when passwords do not match", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SignUp />);

    await user.type(screen.getByPlaceholderText("Enter your full name"), "Test User");
    await user.type(screen.getByPlaceholderText("Enter your email"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Create a password"), "password");
    await user.type(screen.getByPlaceholderText("Confirm your password"), "different");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("creates account and stores initial local data", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SignUp />);

    await user.type(screen.getByPlaceholderText("Enter your full name"), "Test User");
    await user.type(screen.getByPlaceholderText("Enter your email"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Create a password"), "password");
    await user.type(screen.getByPlaceholderText("Confirm your password"), "password");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(localStorage.getItem("token")).toBe("mock-token");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({ name: "Test User", email: "test@test.com" }),
    );
    expect(localStorage.getItem("tasks")).toBe("[]");
    expect(localStorage.getItem("surveys")).toBe("[]");
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});