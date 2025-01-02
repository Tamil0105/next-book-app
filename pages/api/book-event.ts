import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { Event } from "../../types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { event } = req.body as {
    event: Event & {
      guests?: { email: string; phone?: string }[];
      location?: string;
    };
   
  };

  if (!event || !event.summary || !event.start || !event.end) {
    return res.status(400).json({ error: "Missing required event data" });
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  auth.setCredentials({
    access_token:  process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  const calendar = google.calendar({ version: "v3", auth });

  try {
    // Refresh the access token if necessary
    auth.on("tokens", (tokens) => {
      if (tokens.refresh_token) {
        console.log("Refresh Token Updated:", tokens.refresh_token);
      }
      console.log("Access Token Updated:", tokens.access_token);
    });

    // Prepare event details
    const attendees = event.guests?.map((guest:any) => ({
      email: guest.email,
      comment: guest.phone ? `Phone: ${guest.phone}` : undefined,
    }));

    const calendarEvent = {
      summary: event.summary,
      start: event.start,
      end: event.end,
      location: event.location,
      attendees: attendees,
    };

    // Insert the event into the calendar
    //@ts-expect-error
    const createdEvent = await calendar.events.insert({
      calendarId: "primary",
      resource: calendarEvent,
    });

    //@ts-expect-error
    res.status(201).json({ createdEvent: createdEvent.data });
  } catch (error: any) {
    if (error.code === 401) {
      try {
        // Refresh the token and retry the request
        const { credentials } = await auth.refreshAccessToken();
        auth.setCredentials(credentials);

        //@ts-expect-error
        const retryEvent = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
        });

        //@ts-expect-error
        return res.status(201).json({ createdEvent: retryEvent.data });
      } catch (refreshError: any) {
        console.error("Error refreshing token:", refreshError);
        return res.status(500).json({ error: "Failed to refresh access token." });
      }
    }
    console.error("Error creating event:", error.response);
    return res.status(500).json({ error: error.response });
  }
}
