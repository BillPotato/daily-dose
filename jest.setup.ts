import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

const pushMock = jest.fn();
const replaceMock = jest.fn();
const prefetchMock = jest.fn();
const backMock = jest.fn();
const forwardMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    prefetch: prefetchMock,
    back: backMock,
    forward: forwardMock,
    refresh: refreshMock,
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

if (typeof globalThis.fetch !== "function") {
  globalThis.fetch = jest.fn() as typeof fetch;
}

beforeEach(() => {
  pushMock.mockClear();
  replaceMock.mockClear();
  prefetchMock.mockClear();
  backMock.mockClear();
  forwardMock.mockClear();
  refreshMock.mockClear();
  if (typeof globalThis.fetch === "function" && "mockClear" in globalThis.fetch) {
    (globalThis.fetch as jest.Mock).mockClear();
  }
});

declare global {
  // eslint-disable-next-line no-var
  var __mockRouterPush: jest.Mock;
}

globalThis.__mockRouterPush = pushMock;