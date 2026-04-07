import { renderHook, waitFor } from "@testing-library/react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    push: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe("useAuthGuard", () => {
  beforeEach(() => {
    localStorage.clear();
    replaceMock.mockClear();
  });

  it("routes unauthenticated users to /auth/signin", async () => {
    renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/auth/signin");
    });
  });

  it("does not route authenticated users", async () => {
    localStorage.setItem("token", "test-token");

    renderHook(() => useAuthGuard());

    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});