type GoogleCalendarTask = {
  title: string;
  description?: string;
  location?: string;
  start: Date | string | number;
  end: Date | string | number;
};

function toDate(input: Date | string | number) {
  if (input instanceof Date) {
    return input;
  }
  return new Date(input);
}

export function formatGoogleCalendarDate(
  dateInput: Date | string | number,
  fallback: Date,
) {
  const date = toDate(dateInput);
  if (Number.isNaN(date.getTime())) {
    const fallbackIso = fallback.toISOString();
    console.warn("Invalid calendar date from AI. Falling back to safe default.", {
      received: String(dateInput),
      fallback: fallbackIso,
    });
    return fallbackIso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function generateGoogleCalendarUrl(task: GoogleCalendarTask) {
  const fallbackStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const fallbackEnd = new Date(fallbackStart.getTime() + 60 * 60 * 1000);

  const text = encodeURIComponent(task.title);
  const details = encodeURIComponent(task.description ?? "");
  const location = encodeURIComponent(task.location ?? "");
  const start = formatGoogleCalendarDate(task.start, fallbackStart);
  const end = formatGoogleCalendarDate(task.end, fallbackEnd);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}
