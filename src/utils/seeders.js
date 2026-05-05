import { pool } from '../config/database.js'
import logger from '../utils/logger.js'
import bcrypt from 'bcryptjs'

const HASH_SALT = 10

/**
 * Seed database with initial provider users
 */
export const seedProviders = async () => {
  const client = await pool.connect()

  try {
    logger.info('Starting provider seed...')

    // Define seed providers
    const providers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        password: 'Provider123',
        specialization: 'General Practitioner',
        description:
          'Experienced GP with 10+ years in family medicine. Available for general consultations and health checkups.',
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@example.com',
        password: 'Provider123',
        specialization: 'Dentist',
        description:
          'Specialist in dental care, teeth cleaning, and cosmetic dentistry. Gentle approach with modern equipment.',
      },
      {
        name: 'Emma Williams',
        email: 'emma.williams@example.com',
        password: 'Provider123',
        specialization: 'Licensed Therapist',
        description:
          'Mental health counselor specializing in anxiety, depression, and relationship counseling.',
      },
      {
        name: 'Dr. James Rodriguez',
        email: 'james.rodriguez@example.com',
        password: 'Provider123',
        specialization: 'Dermatologist',
        description:
          'Board-certified dermatologist treating skin conditions, acne, and cosmetic procedures.',
      },
    ]

    for (const provider of providers) {
      // Check if user already exists
      const userCheck = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [provider.email],
      )

      let userId

      if (userCheck.rows.length > 0) {
        logger.info(`Provider user already exists: ${provider.email}`)
        userId = userCheck.rows[0].id
      } else {
        // Create user
        const hashedPassword = await bcrypt.hash(provider.password, HASH_SALT)
        const userResult = await client.query(
          `INSERT INTO users (name, email, password_hash, role) 
           VALUES ($1, $2, $3, 'provider') 
           RETURNING id`,
          [provider.name, provider.email, hashedPassword],
        )
        userId = userResult.rows[0].id
        logger.info(`Created provider user: ${provider.email}`)
      }

      // Check if provider profile exists
      const providerCheck = await client.query(
        'SELECT id FROM service_providers WHERE user_id = $1',
        [userId],
      )

      if (providerCheck.rows.length > 0) {
        logger.info(`Provider profile already exists for: ${provider.email}`)
      } else {
        // Create provider profile
        await client.query(
          `INSERT INTO service_providers (user_id, specialization, description) 
           VALUES ($1, $2, $3)`,
          [userId, provider.specialization, provider.description],
        )
        logger.info(`Created provider profile for: ${provider.email}`)
      }
    }

    logger.info('Provider seed completed successfully')
  } catch (error) {
    logger.error('Error seeding providers', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Seed some sample time slots for providers
 */
export const seedTimeSlots = async () => {
  const client = await pool.connect()

  try {
    logger.info('Starting time slots seed...')

    // Get all providers
    const providersResult = await client.query(
      'SELECT id FROM service_providers ORDER BY id LIMIT 2',
    )

    if (providersResult.rows.length === 0) {
      logger.warn('No providers found. Run seedProviders first.')
      return
    }

    // Create time slots for next 7 days
    const today = new Date()
    const slots = []

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const date = new Date(today)
      date.setDate(date.getDate() + dayOffset)
      const dateStr = date.toISOString().split('T')[0]

      // Morning slots: 9:00 AM - 12:00 PM
      const morningSlots = [
        { start: '09:00', end: '10:00', duration: 60 },
        { start: '10:00', end: '11:00', duration: 60 },
        { start: '11:00', end: '12:00', duration: 60 },
      ]

      // Afternoon slots: 2:00 PM - 5:00 PM
      const afternoonSlots = [
        { start: '14:00', end: '15:00', duration: 60 },
        { start: '15:00', end: '16:00', duration: 60 },
        { start: '16:00', end: '17:00', duration: 60 },
      ]

      const allSlots = [...morningSlots, ...afternoonSlots]

      for (const provider of providersResult.rows) {
        for (const slot of allSlots) {
          slots.push({
            provider_id: provider.id,
            date: dateStr,
            start_time: slot.start,
            end_time: slot.end,
            duration: slot.duration,
          })
        }
      }
    }

    // Insert time slots
    let created = 0
    let skipped = 0

    for (const slot of slots) {
      try {
        await client.query(
          `INSERT INTO time_slots (provider_id, slot_date, start_time, end_time, duration) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            slot.provider_id,
            slot.date,
            slot.start_time,
            slot.end_time,
            slot.duration,
          ],
        )
        created++
      } catch (error) {
        if (error.code === '23505') {
          // Duplicate slot, skip
          skipped++
        } else {
          throw error
        }
      }
    }

    logger.info(
      `Time slots seed completed. Created: ${created}, Skipped: ${skipped}`,
    )
  } catch (error) {
    logger.error('Error seeding time slots', error)
    throw error
  } finally {
    client.release()
  }
}

/**
 * Run all seeds
 */
export const runSeeds = async () => {
  try {
    await seedProviders()
    await seedTimeSlots()
    logger.info('All seeds completed successfully')
  } catch (error) {
    logger.error('Error running seeds', error)
    throw error
  }
}
