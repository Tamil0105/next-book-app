import { B } from "@/entities/Booking";
import { Manage } from "@/entities/Manage";
import { AppDataSource } from "@/typeorm.config";
import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";

interface TimeRange {
  start: string; // ISO 8601 date string
  end: string; // ISO 8601 date string
}

interface DateRange {
  start: string; // ISO 8601 date string
  end: string; // ISO 8601 date string
}

interface BlockedDays {
  id: number; // Unique identifier
  timeRanges: TimeRange[]; // Array of time ranges
  isWeekendDisabled: boolean; // Flag indicating if weekends are disabled
  blockedDays: string[]; // Array of blocked days (ISO 8601 date strings)
  dateRange: DateRange; // Object containing start and end date range
}

// Ensure the data source is initialized
const initialize = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await initialize();

  const { date, userLocation } = req.query;

  // Validate the query parameter
  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: "Valid date is required" });
  }


  try {
    // Parse the date using Moment.js
    const parsedDate = moment(date, moment.ISO_8601, true);
    if (!parsedDate.isValid()) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Define all slots
    const allSlots = Array.from({ length: 11 }, (_, i) => moment(parsedDate).hour(8 + i).minute(0).second(0));

    // Fetch bookings for the given date
    const bookings = await AppDataSource.getRepository(B).find({
      where: { date, userLocation: userLocation as string },
    });
    // Fetch manage days
    const manage_days = (await AppDataSource.getRepository(
      Manage
    ).find()) as BlockedDays[];

    // Check if the date is blocked
    if (!manage_days[0].blockedDays.some((d) => moment(d).isSame(parsedDate, "day"))) {
      const availableSlots = allSlots.map((slotMoment) => {
        const slotStart = moment(slotMoment);
        const slotEnd = moment(slotMoment).add(1, "hour");
    
        // Check if the slot is blocked by manage_days
        const isBlockedByManageDays = manage_days.some((manageDay) => {
          return manageDay.timeRanges.some((timeRange) => {
            const rangeStart = moment(`${timeRange.start.slice(0,7)}-${date.slice(8,10)}T${timeRange.start.slice(11)}`);
            const rangeEnd = moment(`${timeRange.end.slice(0,7)}-${date.slice(8,10)}T${timeRange.end.slice(11)}`);
            // Check if the slot is within or equal to the blocked time range
            return (
              slotStart.isSameOrAfter(rangeStart) &&
              slotEnd.isBefore(rangeEnd)
            ) || (
              slotStart.isBetween(rangeStart, rangeEnd, "minute", "[)") ||
              slotEnd.isBetween(rangeStart, rangeEnd, "minute", "(]")
            );
          });
        });
        // console.log(isBlockedByManageDays)
        // Check if the slot is already booked
        // const isBooked = bookings.some((booking) => {
        //   const bookingStartTime = moment(booking.startTime); // Assuming ISO 8601 format
        //   const bookingEndTime = moment(booking.endTime); // Assuming ISO 8601 format
        
        
        
        //   const isSlotBooked =
        //     (slotStart.isSameOrAfter(bookingStartTime) &&
        //       slotEnd.isBefore(bookingEndTime)) ||
        //     slotStart.isBetween(bookingStartTime, bookingEndTime, "minute", "[)") ||
        //     slotEnd.isBetween(bookingStartTime, bookingEndTime, "minute", "(]");
          
        //   return isSlotBooked;
        // });

        const isFutureSlot = slotStart.isAfter(moment());
        return {
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: !bookings.some((booking) => {
            const bookingStartTime = new Date(booking.startTime);
            const bookingEndTime = new Date(booking.endTime);
         
            return (
              (slotStart.toDate() >= bookingStartTime && slotStart.toDate() < bookingEndTime) ||
              (slotEnd.toDate() > bookingStartTime && slotEnd.toDate() <= bookingEndTime) ||
              (slotStart.toDate() <= bookingStartTime && slotEnd.toDate() >= bookingEndTime)
            );
          }) && !isBlockedByManageDays && isFutureSlot,
        };
        
      });

      // Filter out unavailable slots
      const filteredAvailableSlots = availableSlots.filter(
        (slot) => slot.available
      );
     
  

    res.status(200).json(filteredAvailableSlots)
    
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}



