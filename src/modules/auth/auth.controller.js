import { createUser } from './auth.services.js'
import logger from '../../utils/logger.js'
import jwt from 'jsonwebtoken'

/**
 * Handle user registration request
 * @route POST /auth/register
 */
export const registrationHandler = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    // Create user via service layer
    const newUser = await createUser({
      name,
      email,
      password,
      role,
    })

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    })
  } catch (error) {
    // Handle known errors with status codes
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    // Pass unexpected errors to error handler
    logger.error('Registration handler error', error)
    next(error)
  }
}

/**
 * Handle user login request with JWT token generation
 * @route POST /auth/login
 */
export const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Authenticate user via service layer
    const { authenticateUser } = await import('./auth.services.js')
    const user = await authenticateUser(email, password)

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      },
    )

    logger.info(`User logged in successfully: ${user.email}`)

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    // Handle known errors with status codes
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }

    // Pass unexpected errors to error handler
    logger.error('Login handler error', error)
    next(error)
  }
}
