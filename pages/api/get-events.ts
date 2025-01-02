// pages/api/events.js
import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "../../types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date, timeMin,
    timeMax,
    intervalMinutes } = req.query;

  if (!date) return res.status(400).json({ error: "Date is required." });


  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token:  process.env.GOOGLE_ACCESS_TOKEN as any,
    refresh_token:  process.env.GOOGLE_REFRESH_TOKEN as any,
  });

  try {
  //   const   timeMin = new Date(date as string).toISOString()
  // const   timeMax=new Date(new Date(date as string).setDate(new Date(date as string).getDate() + 1)).toISOString()
  // const intervalMinutes = 60
    // Test the access token with a calendar request
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.freebusy.query({
      requestBody: {
         timeMax:timeMax as string,
         timeMin:timeMin as string,   
        timeZone: "Asia/kolkata",
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
    //@ts-ignore
 const busySlots = response.data.calendars["primary"].busy || [];

    // Parse input time range
    const startTime = new Date(timeMin as string ).getTime();
    const endTime = new Date(timeMax as string).getTime();

    // Generate all possible intervals within the range
    const intervals: { start: Date; end: Date }[] = [];
    for (let current = startTime; current < endTime; current += (intervalMinutes as any)  * 60 * 1000) {
      intervals.push({
        start: new Date(current),
        end: new Date(current + (intervalMinutes as any) * 60 * 1000),
      });
    }

    // Filter out intervals that overlap with busy slots
    const availableSlots = intervals.filter((interval) => {
      //@ts-ignore
      return !busySlots.some((busy: { start: string; end: string }) => {
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();

        return (
          (interval.start.getTime() >= busyStart && interval.start.getTime() < busyEnd) || // Starts during a busy slot
          (interval.end.getTime() > busyStart && interval.end.getTime() <= busyEnd) || // Ends during a busy slot
          (interval.start.getTime() <= busyStart && interval.end.getTime() >= busyEnd) // Completely overlaps
        );
      });
    });

    // return { busySlots, availableSlots };
    res.status(200).json({ events: events.data.items as Event[],busySlots, availableSlots });
  } catch (error: any) {
    // If the error is due to an expired access token, refresh it
    if (error.response && error.response.status === 401) {
      try {
        // Refresh the access token
        const { credentials } = await auth.refreshAccessToken();
        auth.setCredentials(credentials);

        // Retry the calendar request with the refreshed token
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
          newAccessToken: credentials.access_token 
        });
      } catch (refreshError: any) {
        res.status(500).json({ error: "Failed to refresh access token.", details: refreshError.message });
      }
    } else {
      res.status(500).json({ error: error.message });
    }
  }
}
