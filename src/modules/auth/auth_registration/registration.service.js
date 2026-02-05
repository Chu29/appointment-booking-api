import { pool } from "../../../config/database.js";
import logger from "../../../utils/logger.js";
import bcrypt from "bcryptjs";

const HASH_SALT = 10;

/**
 * Check if a user with the given email already exists
 * @param {string} email - User email
 * @returns {Promise<boolean>} - True if user exists, false otherwise
 */
const userExists = async (email) => {
  const query = "SELECT email FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows.length > 0;
};

/**
 * Hash a plain text password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, HASH_SALT);
};

/**
 * Create a new user in the database
 * @param {Object} userData - User data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - Plain text password
 * @param {string} userData.role - User's role (client or provider)
 * @returns {Promise<Object>} - Created user object
 */
export const createUser = async ({ name, email, password, role }) => {
  try {
    // Check if user already exists
    const exists = await userExists(email);
    if (exists) {
      logger.warn(
        `Registration failed: User with email already exists - ${email}`,
      );
      const error = new Error(`User with email ${email} already exists`);
      error.status = 409;
      throw error;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    logger.debug(`Password hashed for email - ${email}`);

    // Insert user into database
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email, role, created_at
    `;

    const result = await pool.query(insertQuery, [
      name,
      email,
      hashedPassword,
      role,
    ]);

    const newUser = result.rows[0];
    logger.info(
      `User registered successfully: ID=${newUser.id}, Role=${newUser.role}`,
    );

    return newUser;
  } catch (error) {
    logger.error("Error creating user", { email, error: error.message });
    throw error;
  }
};
