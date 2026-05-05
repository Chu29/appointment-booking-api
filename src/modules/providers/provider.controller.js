import {
  getProviderByUserId,
  getAllProviders,
  updateProviderProfile,
} from './provider.service.js'
import logger from '../../utils/logger.js'

/**
 * Get current provider profile (authenticated provider)
 * @route GET /providers/profile
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const provider = await getProviderByUserId(userId)

    res.status(200).json({
      message: 'Provider profile retrieved successfully',
      provider,
    })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error('Get provider profile error', error)
    next(error)
  }
}

/**
 * Get all service providers (public or authenticated)
 * @route GET /providers
 */
export const getProviders = async (req, res, next) => {
  try {
    const providers = await getAllProviders()

    res.status(200).json({
      message: 'Providers retrieved successfully',
      count: providers.length,
      providers,
    })
  } catch (error) {
    logger.error('Get providers error', error)
    next(error)
  }
}

/**
 * Update provider profile (authenticated provider)
 * @route PUT /providers/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { specialization, description } = req.body

    const updatedProvider = await updateProviderProfile(userId, {
      specialization,
      description,
    })

    res.status(200).json({
      message: 'Provider profile updated successfully',
      provider: updatedProvider,
    })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    logger.error('Update provider profile error', error)
    next(error)
  }
}
