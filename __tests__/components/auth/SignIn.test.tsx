import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "@/components/auth/SignIn";

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

describe("SignIn", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    pushMock.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("accepts user input and signs in valid credentials", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SignIn />);

    await user.type(screen.getByPlaceholderText("Enter your email"), "test@test.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(localStorage.getItem("token")).toBe("mock-token");
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify({ name: "Test User", email: "test@test.com" }),
    );
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows validation error for invalid credentials", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SignIn />);

    await user.type(screen.getByPlaceholderText("Enter your email"), "wrong@test.com");
    await user.type(screen.getByPlaceholderText("Enter your password"), "nope");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(
      screen.getByText("Invalid credentials. Use: test@test.com / password"),
    ).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });
});