import { createUser } from "./registration.service.js";
import logger from "../../../utils/logger.js";

/**
 * Handle user registration request
 * @route POST /auth/register
 */
export const registrationHandler = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user via service layer
    const newUser = await createUser({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    // Handle known errors with status codes
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }

    // Pass unexpected errors to error handler
    logger.error("Registration handler error", error);
    next(error);
  }
};
