import { Booking } from "@/entities/Booking";
import { AppDataSource } from "@/typeorm.config";
import { NextApiRequest, NextApiResponse } from "next";


type Slot = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
};

type GroupedBooking = {
  id: number;
  orderId: string;
  date: string;
  userName: string;
  amount: string;
  paymentStatus: string;
  peopleCount: string;
  phoneNumber: string;
  userEmail: string;
  userLocation: string;
  slots: Slot[];
};

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
  await initialize();

  if (req.method === "GET") {
    try {
      const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 items per page
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);

      if (isNaN(pageNumber) || isNaN(pageSize)) {
        return res.status(400).json({ error: "Invalid page or limit value" });
      }

      const [bookings, total] = await AppDataSource.getRepository(Booking)
        .createQueryBuilder("booking")
        .skip((pageNumber - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount(); // Get both data and total count

      // Transform data: Group by order_id
      const groupedData = bookings.reduce<Record<string, GroupedBooking>>((acc, booking) => {
        const {
          id,
          orderId,
          date,
          startTime,
          endTime,
          userName,
          userLocation,
          amount,
          paymentStatus,
          peopleCount,
          phoneNumber,
          userEmail,
        } = booking;
        if (!acc[orderId]) {
          acc[orderId] = {
            id,
            orderId,
            date,
            userName,
            amount,
            paymentStatus,
            peopleCount,
            phoneNumber,
            userEmail,
            userLocation,
            slots: [],
          };
        }
        acc[orderId].slots.push({
            id,
          date,
          startTime,
          endTime,
        });

        return acc;
      }, {});

      // Convert grouped data object to an array
      const result = Object.values(groupedData);


      res.status(200).json({
        bookings: result,
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      console.error("Error fetching and grouping booked slots:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
