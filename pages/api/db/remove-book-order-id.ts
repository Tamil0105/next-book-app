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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await initialize();

  const {orderId } = req.query;

  // Validate the request query
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const bookingRepository = AppDataSource.getRepository(Booking);

    // Check if the booking exists
    const booking = await bookingRepository.findBy({ orderId: orderId as string });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Delete the booking
    await bookingRepository.remove(booking);

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
