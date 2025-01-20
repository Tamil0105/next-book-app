import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('manage')
export class Manage {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column('json', { nullable: true })
    timeRanges!: { start: string; end: string }[]; // Store time ranges as an array of objects
  
    @Column({ default: false })
    isWeekendDisabled!: boolean; // Store the weekend disable status
  
    @Column('text', { array: true, nullable: true })
    blockedDays!: string[]; // Store blocked days as an array of strings
  
    @Column('json', { nullable: true })
    dateRange!: { start: string; end: string }; // Store date range as an object with start and end properties

    // User details
    @Column({ nullable: true })
    name!: string; // User's name

    @Column({ nullable: true, unique: true })
    email!: string; // User's email

    @Column({ nullable: true })
    password!: string; // User's password

    // Turf options
    @Column('text', { array: true, nullable: true })
    turfOptions!: string[]; // Store turf options as an array of strings
}