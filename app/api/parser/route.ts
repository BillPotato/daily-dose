import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

type ParserPayload = {
  content?: string;
};

function buildPrompt(content: string) {
  const today = new Date().toLocaleDateString("en-US");
  return `
You are an intelligent medical assistant responsible for extracting actionable tasks from patient notes. Your task is to analyze the provided text and identify all medical tasks such as medication schedules, appointments, and symptom monitoring.

Your response MUST be a single, plain-text valid JSON object. Do not include any text or explanations before or after the JSON object.

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
  return raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ParserPayload;
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const model = getGeminiModel();
    const result = await model.generateContent(buildPrompt(body.content));
    const text = result.response.text();
    const cleaned = stripCodeFence(text);

    return NextResponse.json(cleaned, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Parser request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
