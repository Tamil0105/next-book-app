import { D } from "@/entities";
import { AppDataSource } from "@/typeorm.config";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const BlockRepository = AppDataSource.getRepository(D);

  if (req.method === "DELETE") {
    const { day } = req.body;

    if (!day) {
      res.status(400).json({ error: "Day is required" });
      return;
    }

    try {
      const blockDay = await BlockRepository.findOneBy({ date: day });
      if (!blockDay) {
        res.status(404).json({ error: "Day not found" });
        return;
      }

      await BlockRepository.remove(blockDay);
      res.status(200).json({ message: "Day removed successfully" });
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
