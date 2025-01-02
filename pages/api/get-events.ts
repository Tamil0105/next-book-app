import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "../../types";

interface BusySlot {
  start: string;
  end: string;
}

interface Interval {
  start: Date;
  end: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date, timeMin, timeMax, intervalMinutes } = req.query;

  if (!date) return res.status(400).json({ error: "Date is required." });

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  try {
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMax: timeMax as string,
        timeMin: timeMin as string,
        timeZone: "Asia/Kolkata",
        items: [{ id: "primary" }],
      },
    });

    const events = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date(date as string).toISOString(),
      timeMax: new Date(new Date(date as string).setDate(new Date(date as string).getDate() + 1)).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const busySlots: BusySlot[] = (response.data.calendars?.primary?.busy ?? []) as BusySlot[];

    const startTime = new Date(timeMin as string).getTime();
    const endTime = new Date(timeMax as string).getTime();

    const intervals: Interval[] = [];
    for (let current = startTime; current < endTime; current += Number(intervalMinutes) * 60 * 1000) {
      intervals.push({
        start: new Date(current),
        end: new Date(current + Number(intervalMinutes) * 60 * 1000),
      });
    }

    const availableSlots = intervals.filter((interval) => {
      return !busySlots.some((busy) => {
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();

        return (
          (interval.start.getTime() >= busyStart && interval.start.getTime() < busyEnd) || 
          (interval.end.getTime() > busyStart && interval.end.getTime() <= busyEnd) || 
          (interval.start.getTime() <= busyStart && interval.end.getTime() >= busyEnd)
        );
      });
    });

    res.status(200).json({ events: events.data.items as Event[], busySlots, availableSlots });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error.response as { status?: number })?.status === 401
    ) {
      try {
        const { credentials } = await auth.refreshAccessToken();
        auth.setCredentials(credentials);

        const calendar = google.calendar({ version: "v3", auth });
        const events = await calendar.events.list({
          calendarId: "primary",
          timeMin: new Date(date as string).toISOString(),
          timeMax: new Date(new Date(date as string).setDate(new Date(date as string).getDate() + 1)).toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        });

        res.status(200).json({
          events: events.data.items as Event[],
          newAccessToken: credentials.access_token,
        });
      } catch (refreshError: unknown) {
        res.status(500).json({
          error: "Failed to refresh access token.",
          details: refreshError instanceof Error ? refreshError.message : "Unknown error",
        });
      }
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
