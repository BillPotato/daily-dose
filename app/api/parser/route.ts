import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { Ratelimit } from "@upstash/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ParserPayload = {
  content?: string;
};

type GeminiTask = {
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
};

type GeminiResponse = {
  tasks: GeminiTask[];
};

const isRateLimitingEnabled = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
);

let ratelimitInstance: Ratelimit | null = null;
let hasLoggedBypassWarning = false;

async function getRateLimiter() {
  if (!isRateLimitingEnabled) {
    return null;
  }

  if (ratelimitInstance) {
    return ratelimitInstance;
  }

  const { kv } = await import("@vercel/kv");

  ratelimitInstance = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.fixedWindow(15, "1 d"),
    analytics: true,
    prefix: "ratelimit:gemini:parser",
  });

  return ratelimitInstance;
}

function getClientIp(request: NextRequest) {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function buildPrompt(content: string) {
  const today = new Date().toLocaleDateString("en-US");
  return `
You are an intelligent medical assistant responsible for extracting actionable tasks from patient notes. Your task is to analyze the provided text and identify all medical tasks such as medication schedules, appointments, and symptom monitoring.

Your response MUST be a single, plain-text valid JSON object.
Return ONLY valid JSON. Do not include markdown blocks like \`\`\`json.
Do not include any text or explanations before or after the JSON object.

The JSON object should have a single key, "tasks", which contains a list of task objects.

Today is ${today}, so create the dates accordingly.

The JSON object shape must match this structure:
{
  "tasks": [
    {
      "summary": "Google I/O 2015",
      "description": "A chance to hear more about Google's developer products.",
      "start": {
        "dateTime": "2025-10-04T09:00:00",
        "timeZone": "America/New_York"
      },
      "end": {
        "dateTime": "2025-10-04T10:00:00",
        "timeZone": "America/New_York"
      },
      "reminders": {
        "useDefault": false,
        "overrides": [
          { "method": "email", "minutes": 1440 },
          { "method": "popup", "minutes": 10 }
        ]
      }
    }
  ]
}

Task start time and end time should be at least 2 hours apart.

If the input is plain text, make as many tasks as possible for a whole week. Each day should have one task. Make the time different for each task so they fill the screen. Make task names different and diverse.
If the input is json, create a task for those tasks only.

Here is the medical text to analyze:
---
${content}
---
`;
}

function stripCodeFence(raw: string) {
  return raw
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toSafeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeTask(task: unknown, index: number): GeminiTask {
  const taskObj = isObject(task) ? task : {};
  const startObj = isObject(taskObj.start) ? taskObj.start : {};
  const endObj = isObject(taskObj.end) ? taskObj.end : {};

  return {
    summary: toSafeString(taskObj.summary, `Health Task ${index + 1}`),
    description: toSafeString(taskObj.description, ""),
    location: toSafeString(taskObj.location, ""),
    start: {
      dateTime: toSafeString(startObj.dateTime, ""),
      timeZone: toSafeString(startObj.timeZone, "UTC"),
    },
    end: {
      dateTime: toSafeString(endObj.dateTime, ""),
      timeZone: toSafeString(endObj.timeZone, "UTC"),
    },
  };
}

function parseGeminiResponse(raw: string): GeminiResponse {
  const cleaned = stripCodeFence(raw);
  const parsed = JSON.parse(cleaned) as unknown;

  if (!isObject(parsed)) {
    throw new Error("Gemini response is not a JSON object.");
  }

  const tasksRaw = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  return {
    tasks: tasksRaw.map(normalizeTask),
  };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    if (!isRateLimitingEnabled) {
      if (!hasLoggedBypassWarning) {
        console.warn("Rate limiting is disabled locally. Bypassing check.");
        hasLoggedBypassWarning = true;
      }
    } else {
      const ratelimit = await getRateLimiter();
      const { success, remaining, reset } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error: "You have reached your limit of 15 queries. Please try again later.",
            quotaExceeded: true,
            limit: 15,
            remaining,
            reset,
          },
          { status: 429 },
        );
      }
    }

    const body = (await request.json()) as ParserPayload;
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const model = getGeminiModel();
    const result = await model.generateContent(buildPrompt(body.content));
    const text = result.response.text();
    const parsed = parseGeminiResponse(text);

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Parser request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}