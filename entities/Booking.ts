import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', length: 255 })
  paymentStatus!: string;

  @Column({ type: 'varchar', length: 255 })
  startTime!: string;

  @Column({ type: 'varchar', length: 255 })
  endTime!: string;

  @Column({ type: 'varchar', length: 255 })
  userName!: string;

  @Column({ type: 'varchar', length: 255 })
  userEmail!: string;

  @Column({ type: 'varchar', length: 255 })
  userLocation!: string;

  @Column({ type: 'varchar', length: 255 })
  phoneNumber!: string;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({ type: 'bigint' })
  peopleCount!: string;

  @Column({ type: 'varchar', length: 255})
  orderId!: string;
}
