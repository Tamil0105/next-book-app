import { D,B } from '@/entities';
import { AppDataSource } from '@/typeorm.config';
import { NextApiRequest, NextApiResponse } from 'next';

// Ensure the data source is initialized
const initialize = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initialize();

  const { date,userLocation} = req.query;

  // Validate the query parameter
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Valid date is required' });
  }
  const blockDaysRepository = AppDataSource.getRepository(D);

  try {
    // Parse the date to create a Date object
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Define all slots
    const allSlots = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

    // Fetch bookings for the given date
    const bookings = await AppDataSource.getRepository(B).find({
      where: { date,userLocation:userLocation as string },
    });

    const blockDay = await blockDaysRepository.findOneBy({ date });

    // Calculate available slots
   if(!blockDay){
    const availableSlots = allSlots.map((slot) => {
      const [hour, minute] = slot.split(':');
      const slotDate = new Date(parsedDate);
      slotDate.setHours(parseInt(hour), parseInt(minute), 0, 0); // Set the time for the slot

      // Calculate end time (assuming each booking lasts 1 hour)
      const endTimeDate = new Date(slotDate);
      endTimeDate.setHours(endTimeDate.getHours() + 1); // Add 1 hour for end time

      return {
        startTime: slotDate.toISOString(), // Convert to ISO string
        endTime: endTimeDate.toISOString(), // Convert to ISO string
        available: !bookings.some((booking) => {
          const bookingStartTime = new Date(booking.startTime);
          const bookingEndTime = new Date(booking.endTime);
          return (
            (slotDate >= bookingStartTime && slotDate < bookingEndTime) ||
            (endTimeDate > bookingStartTime && endTimeDate <= bookingEndTime)
          );
        }),
      };
    });

    res.status(200).json(availableSlots);
   }else{
    res.status(200).json([]);

   }
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}