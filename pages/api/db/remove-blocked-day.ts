import { BlockDays } from "@/entities";
import { AppDataSource } from "@/typeorm.config";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const blockDaysRepository = AppDataSource.getRepository(BlockDays);

  if (req.method === "DELETE") {
    const { day } = req.body;

    if (!day) {
      res.status(400).json({ error: "Day is required" });
      return;
    }

    try {
      const blockDay = await blockDaysRepository.findOneBy({ date: day });
      if (!blockDay) {
        res.status(404).json({ error: "Day not found" });
        return;
      }

      await blockDaysRepository.remove(blockDay);
      res.status(200).json({ message: "Day removed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
