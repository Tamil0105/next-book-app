import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class BlockDays {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;
}
