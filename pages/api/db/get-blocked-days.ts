import { NextApiRequest, NextApiResponse } from "next";
import { AppDataSource } from "@/typeorm.config";
import { D } from "@/entities/BlockDays";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Ensure the database connection is established
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Fetch blocked days from the database
      const blockedDaysRepository = AppDataSource.getRepository(D);
      const blockedDays = await blockedDaysRepository.find();

      res.status(200).json({ blockedDays });
    } catch (error) {
      console.error("Error retrieving blocked days:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
