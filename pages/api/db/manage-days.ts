import { Manage } from '@/entities/Manage';
import { AppDataSource } from '@/typeorm.config';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const blockedDaysRepository = AppDataSource.getRepository(Manage);

  switch (req.method) {
    case 'GET':
      try {
        const blockedDays = await blockedDaysRepository.find();
        res.status(200).json(blockedDays);
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error fetching blocked days.', error });
      }
      break;

    case 'POST':
      try {
        const newBlockedDays: Manage = req.body; // Expecting a BlockedDays object
        const savedBlockedDays = await blockedDaysRepository.save(newBlockedDays);
        res.status(201).json(savedBlockedDays);
      } catch (error) {
        res.status(500).json({ message: 'Error saving blocked days.', error });
      }
      break;

    case 'PUT':
      try {
        const updatedBlockedDays: Manage = req.body; // Expecting a BlockedDays object with an id
        if (!updatedBlockedDays.id) {
          return res.status(400).json({ message: 'ID is required for updating blocked days.' });
        }
        const existingBlockedDays = await blockedDaysRepository.findOneBy({ id: updatedBlockedDays.id });
        if (!existingBlockedDays) {
          return res.status(404).json({ message: 'Blocked days not found.' });
        }
        await blockedDaysRepository.update(updatedBlockedDays.id, updatedBlockedDays);
        res.status(200).json({ message: 'Blocked days updated successfully.' });
      } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating blocked days.', error });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body; // Expecting an object with the id to delete
        if (!id) {
          return res.status(400).json({ message: 'ID is required for deletion.' });
        }
        const result = await blockedDaysRepository.delete(id);
        if (result.affected === 0) {
          return res.status(404).json({ message: 'Blocked days not found.' });
        }
        res.status(204).end();
      } catch (error) {
        res.status(500).json({ message: 'Error deleting blocked days.', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default handler;