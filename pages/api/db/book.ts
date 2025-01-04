import { Booking } from '@/entities/Booking';
import { AppDataSource } from '@/typeorm.config';
import { NextApiRequest, NextApiResponse } from 'next';

// Ensure the data source is initialized
const initialize = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initialize();

  const { date, startTime, endTime, userLocation,userName, phoneNumber,userEmail } = req.body;

 console.log(date,startTime,endTime,userLocation,userName, phoneNumber,userEmail)

  // Validate the request body
  if (!date || !startTime || !endTime || !userName || !userEmail||!phoneNumber) {
    return res.status(400).json({ error: 'Date, startTime, endTime, userName, and userMail are required' });
  }

  try {
    // Parse the date and times
    const parsedDate = new Date(date);
    // const parsedStartTime = new Date(startTime);
    // const parsedEndTime = new Date(endTime);

    // Extract time in HH:MM format
    // const startTimeString = parsedStartTime.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
    // const endTimeString = parsedEndTime.toTimeString().split(' ')[0].slice(0, 5); // HH:MM

    // Create a new booking instance
    const booking = new Booking();
    booking.date = parsedDate.toISOString().split('T')[0]; // Store date in YYYY-MM-DD format
    booking.startTime = startTime // Store only the time
    booking.endTime = endTime; // Store only the time
    booking.userName = userName; // Store user name
    booking.userEmail = userEmail; // Store user email
    booking.userLocation = userLocation; // Store user email
    booking.phoneNumber = phoneNumber; // Store user email



    // Save the booking
    await AppDataSource.getRepository(Booking).save(booking);

    res.status(201).json({ message: 'Slot booked successfully', booking });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}