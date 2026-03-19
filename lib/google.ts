import path from "node:path";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

function getAuthConfig() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;

  if (keyJson) {
    return {
      credentials: JSON.parse(keyJson),
      scopes: SCOPES,
    };
  }

  return {
    keyFile: keyPath
      ? path.resolve(process.cwd(), keyPath)
      : path.resolve(process.cwd(), "credentials/keys.json"),
    scopes: SCOPES,
  };
}

export function getCalendarClient() {
  const auth = new google.auth.GoogleAuth(getAuthConfig());
  return google.calendar({ version: "v3", auth });
}

export function getCalendarId() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error("Missing GOOGLE_CALENDAR_ID environment variable.");
  }
  return calendarId;
}
