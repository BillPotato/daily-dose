import {
  formatGoogleCalendarDate,
  generateGoogleCalendarUrl,
} from "@/lib/googleCalendarUrl";

describe("googleCalendarUrl", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(Date.parse("2026-04-07T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("formats valid dates to Google Calendar format", () => {
    const result = formatGoogleCalendarDate(
      "2026-04-08T15:30:00.000Z",
      new Date("2026-04-09T00:00:00.000Z"),
    );

    expect(result).toBe("20260408T153000Z");
  });

  it("falls back for invalid dates and logs a warning", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const fallback = new Date("2026-04-10T09:00:00.000Z");

    const result = formatGoogleCalendarDate("not-a-date", fallback);

    expect(result).toBe("20260410T090000Z");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "Invalid calendar date from AI. Falling back to safe default.",
      {
        received: "not-a-date",
        fallback: "2026-04-10T09:00:00.000Z",
      },
    );
  });

  it("generates an exact Google Calendar URL with encoded fields", () => {
    const url = generateGoogleCalendarUrl({
      title: "Doctor Visit",
      description: "Bring BP log & meds",
      location: "Clinic A, Room #2",
      start: "2026-04-11T14:15:00.000Z",
      end: "2026-04-11T15:00:00.000Z",
    });

    expect(url).toBe(
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Doctor%20Visit&dates=20260411T141500Z/20260411T150000Z&details=Bring%20BP%20log%20%26%20meds&location=Clinic%20A%2C%20Room%20%232",
    );
  });

  it("uses empty detail and location when omitted", () => {
    const url = generateGoogleCalendarUrl({
      title: "Medication",
      start: "2026-04-11T08:00:00.000Z",
      end: "2026-04-11T08:30:00.000Z",
    });

    expect(url).toContain("details=");
    expect(url).toContain("location=");
    expect(url).toContain("text=Medication");
  });
});