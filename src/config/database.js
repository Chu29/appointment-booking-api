import { Pool } from "pg";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

// check if NODE_ENV is test, then load .env.test file
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test", override: true });
  logger.info("Loaded .env.test file for testing environment");
} else {
  dotenv.config();
  logger.info("Loaded .env file for non-testing environment");
}

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env; // Get DB config from env variables

// Here, I make sure all required DB env variables are set
if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  logger.error("Database configuration variables are missing");
  process.exit(1);
}

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // host: DB_HOST,
  // port: parseInt(DB_PORT, 10),
  // database: DB_NAME,
  // user: DB_USER,
  // password: DB_PASSWORD,
  // connectionTimeoutMillis: 5000,
  ssl: {
    rejectUnauthorized: false,
  },
});

logger.info(`Database pool created for ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);

// Listen for connect events emitted on the pool
pool.on("connect", () => {
  logger.info("Database client connected");
});

// Listen for errors emitted on the pool
pool.on("error", (err) => {
  logger.error("Unexpected error on idle database client", err);
  process.exit(-1);
});

// Initialize the DB schema
const initDbSchema = async () => {
  const client = await pool.connect();

  try {
    logger.info("Initializing database schema...");
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

    // Create users table (both clients and providers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'provider')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info("Users table has been successfully created.");

    // Service Providers table (extended info for providers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_providers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE,
      specialization VARCHAR(100),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    logger.info("Service providers table has been successfully created.");

    // Time Slots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
      id SERIAL PRIMARY KEY,
      provider_id INTEGER NOT NULL,
      slot_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      duration INTEGER NOT NULL, -- in minutes
      is_booked BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
      
      -- Prevent overlapping slots for same provider
      CONSTRAINT unique_provider_time UNIQUE (provider_id, slot_date, start_time)
      );
   `);

    logger.info("Time slots table has been successfully created.");

    // Appointments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      client_id INTEGER NOT NULL,
      provider_id INTEGER NOT NULL,
      time_slot_id INTEGER NOT NULL UNIQUE,
      status VARCHAR(20) DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled', 'completed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (provider_id) REFERENCES service_providers(id) ON DELETE CASCADE,
      FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE
      );
    `);

    logger.info("Appointments table has been successfully created.");

    // Indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_time_slots_provider ON time_slots(provider_id);
      CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(slot_date);
      CREATE INDEX IF NOT EXISTS idx_time_slots_booked ON time_slots(is_booked);
      CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    `);

    logger.info("Database schema initialization completed successfully.");
  } catch (error) {
    logger.error("Error initializing database schema", error);
  } finally {
    client.release();
  }
};

const connectToDb = async () => {
  try {
    const client = await pool.connect();
    logger.info("Successfully connected to the database");
    client.release();
    await initDbSchema();
  } catch (error) {
    logger.error("Error connecting to the database", error);
    process.exit(1);
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const response = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(
      `Executed query: { text: ${text.substring(0, 100)}..., params: ${JSON.stringify(params)}, duration: ${duration}ms, rows: ${response.rowCount}}`,
    );
    return response;
  } catch (error) {
    logger.error(
      `Error executing query: { text: ${text.substring(0, 100)}..., params: ${JSON.stringify(params)}, error: ${error.message}}`,
    );
    throw error;
  }
};

export { pool, initDbSchema, connectToDb, query };
