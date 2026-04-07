/** @jest-environment node */

const textMock = jest.fn();
const generateContentMock = jest.fn();
const getGenerativeModelMock = jest.fn(() => ({
  generateContent: generateContentMock,
}));

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: getGenerativeModelMock,
  })),
}));

function createMockRequest(body: unknown) {
  return {
    headers: new Headers({ "x-forwarded-for": "203.0.113.10" }),
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("api/parser POST", () => {
  beforeEach(() => {
    jest.resetModules();
    textMock.mockReset();
    generateContentMock.mockReset();
    getGenerativeModelMock.mockClear();
  });

  it("returns 200 and parsed task data from mocked Gemini output", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    textMock.mockReturnValue(
      JSON.stringify({
        tasks: [
          {
            summary: "Take Metformin",
            description: "After breakfast",
            location: "Home",
            start: {
              dateTime: "2026-04-08T08:00:00.000Z",
              timeZone: "UTC",
            },
            end: {
              dateTime: "2026-04-08T10:00:00.000Z",
              timeZone: "UTC",
            },
          },
        ],
      }),
    );
    generateContentMock.mockResolvedValue({
      response: {
        text: textMock,
      },
    });

    const route = await import("@/app/api/parser/route");
    const response = await route.POST(
      createMockRequest({ content: "Take metformin every morning" }) as never,
    );

    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      tasks: [
        {
          summary: "Take Metformin",
          description: "After breakfast",
          location: "Home",
          start: {
            dateTime: "2026-04-08T08:00:00.000Z",
            timeZone: "UTC",
          },
          end: {
            dateTime: "2026-04-08T10:00:00.000Z",
            timeZone: "UTC",
          },
        },
      ],
    });
    expect(getGenerativeModelMock).toHaveBeenCalledTimes(1);
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when content is missing", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    const route = await import("@/app/api/parser/route");
    const response = await route.POST(createMockRequest({ content: "" }) as never);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "content is required" });
    expect(generateContentMock).not.toHaveBeenCalled();
  });
});