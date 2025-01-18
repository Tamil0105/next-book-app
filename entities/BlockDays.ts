import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('blocked_days') // Specify the table name if necessary
export class D {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;
}
