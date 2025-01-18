import { DataSource } from 'typeorm';
import { Booking, BlockDays } from './entities';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'pg-29b44638-chysir-8ac8.b.aivencloud.com',
  port: 17179,
  username: 'avnadmin',
  password: 'AVNS_RHBrSm2RmeRDWqaO1sh',
  database: 'defaultdb',
  synchronize: true,
  logging: true,
  ssl: {
    rejectUnauthorized: false, // Use true for stricter validation
  },
  migrations: ['src/migrations/**/*.ts'], // Path to migrations
  entities: [Booking,BlockDays],
});
