import { NextRequest, NextResponse } from "next/server";
import { getCalendarClient, getCalendarId } from "@/lib/google";

type CalendarPayload = {
  events: unknown;
};

function normalizeEvents(input: unknown): Record<string, unknown>[] {
  if (typeof input === "string") {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed?.tasks)) {
      return parsed.tasks;
    }
    if (Array.isArray(parsed)) {
      return parsed;
    }
  }

  if (typeof input === "object" && input !== null) {
    const obj = input as { tasks?: Record<string, unknown>[] };
    if (Array.isArray(obj.tasks)) {
      return obj.tasks;
    }
  }

  return [];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CalendarPayload;
    const events = normalizeEvents(body.events);

    if (events.length === 0) {
      return NextResponse.json(
        { error: "No events were provided." },
        { status: 400 },
      );
    }

    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const results = [];

    for (const event of events) {
      const result = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });
      results.push(result.data.htmlLink);
    }

    return NextResponse.json({ status: "success", links: results }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create calendar events.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
