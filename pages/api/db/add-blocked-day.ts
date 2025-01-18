import { BlockDays } from "@/entities";
import { AppDataSource } from "@/typeorm.config";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize the database connection if not already initialized
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const blockDaysRepository = AppDataSource.getRepository(BlockDays);

  if (req.method === "POST") {
    const { day } = req.body;

    if (!day) {
      res.status(400).json({ error: "Day is required" });
      return;
    }

    try {
      // Check if the day is already blocked
      const existingBlockDay = await blockDaysRepository.findOneBy({ date: day });

      if (existingBlockDay) {
        res.status(400).json({ error: "Day is already blocked" });
        return;
      }

      // Create a new blocked day entry
      const newBlockDay = blockDaysRepository.create({ date: day });
      await blockDaysRepository.save(newBlockDay);

      // Fetch the updated list of blocked days
      const blockedDays = await blockDaysRepository.find();

      res.status(201).json({
        message: "Day blocked successfully",
        blockedDays,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
