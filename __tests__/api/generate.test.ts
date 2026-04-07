/** @jest-environment node */

const limitMock = jest.fn();
const fixedWindowMock = jest.fn(() => ({ strategy: "fixed-window" }));
const textMock = jest.fn();
const generateContentMock = jest.fn();
const getGenerativeModelMock = jest.fn(() => ({
  generateContent: generateContentMock,
}));

const RatelimitMock = jest.fn().mockImplementation(() => ({
  limit: limitMock,
}));
(RatelimitMock as unknown as { fixedWindow: typeof fixedWindowMock }).fixedWindow =
  fixedWindowMock;

jest.mock("@upstash/ratelimit", () => ({
  Ratelimit: RatelimitMock,
}));

jest.mock("@vercel/kv", () => ({
  kv: {},
}));

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: getGenerativeModelMock,
  })),
}));

jest.mock("mongodb", () => ({
  MongoClient: jest.fn(),
}));

function createMockRequest(body: unknown) {
  return {
    headers: new Headers({ "x-forwarded-for": "203.0.113.20" }),
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("api/generate POST", () => {
  beforeEach(() => {
    jest.resetModules();
    limitMock.mockReset();
    fixedWindowMock.mockClear();
    textMock.mockReset();
    generateContentMock.mockReset();
    getGenerativeModelMock.mockClear();
    RatelimitMock.mockClear();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.KV_REST_API_URL = "https://example.test";
    process.env.KV_REST_API_TOKEN = "test-token";

    limitMock.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: 1712500000,
    });

    const route = await import("@/app/api/generate/route");
    const response = await route.POST(
      createMockRequest({ content: "rate-limit-me" }) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(json).toEqual(
      expect.objectContaining({
        quotaExceeded: true,
        limit: 15,
      }),
    );
    expect(RatelimitMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it("returns 200 and parsed tasks when request is allowed", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.KV_REST_API_URL = "https://example.test";
    process.env.KV_REST_API_TOKEN = "test-token";

    limitMock.mockResolvedValue({
      success: true,
      remaining: 14,
      reset: 1712500000,
    });

    textMock.mockReturnValue(
      JSON.stringify({
        tasks: [
          {
            summary: "Hydration Reminder",
            description: "Drink 500ml water",
            location: "Office",
            start: {
              dateTime: "2026-04-09T10:00:00.000Z",
              timeZone: "UTC",
            },
            end: {
              dateTime: "2026-04-09T12:00:00.000Z",
              timeZone: "UTC",
            },
          },
        ],
      }),
    );
    generateContentMock.mockResolvedValue({ response: { text: textMock } });

    const route = await import("@/app/api/generate/route");
    const response = await route.POST(
      createMockRequest({ content: "Drink more water every day" }) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      tasks: [
        {
          summary: "Hydration Reminder",
          description: "Drink 500ml water",
          location: "Office",
          start: {
            dateTime: "2026-04-09T10:00:00.000Z",
            timeZone: "UTC",
          },
          end: {
            dateTime: "2026-04-09T12:00:00.000Z",
            timeZone: "UTC",
          },
        },
      ],
    });
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });
});