import { DataSource } from 'typeorm';
import { Booking, BlockDays } from './entities';


export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 5432,
  username: 'postgres.mrkrdjmdwoojbvkoicyn',
  password: 'durBTBqPWFVOAfkP',
  database: 'postgres',
  synchronize: true,
  logging: true,
  ssl: {
    rejectUnauthorized: false, // Use true for stricter validation
  },
  migrations: ['src/migrations/**/*.ts'], // Path to migrations
  entities: [Booking,BlockDays],
});
// postgresql://postgres.mrkrdjmdwoojbvkoicyn:durBTBqPWFVOAfkP@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

// # Connect to Supabase via connection pooling with Supavisor.
// DATABASE_URL="postgresql://postgres.mrkrdjmdwoojbvkoicyn:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

// # Direct connection to the database. Used for migrations.
// DIRECT_URL="postgresql://postgres.mrkrdjmdwoojbvkoicyn:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
        