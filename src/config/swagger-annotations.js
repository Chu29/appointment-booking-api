/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       403:
 *         description: Not authorized
 *       401:
 *         description: Unauthorized
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Account deleted
 *       403:
 *         description: Not authorized
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/{id}/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - old_password
 *               - new_password
 *             properties:
 *               old_password:
 *                 type: string
 *                 format: password
 *               new_password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Get all service providers
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of providers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Provider'
 */

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     summary: Get provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Provider user ID
 *     responses:
 *       200:
 *         description: Provider profile
 *       404:
 *         description: Provider not found
 *   put:
 *     summary: Update provider profile
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provider profile updated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /time-slots:
 *   get:
 *     summary: Get time slots with optional filters
 *     tags: [Time Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: slot_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: is_booked
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TimeSlot'
 *   post:
 *     summary: Create a new time slot (provider only)
 *     tags: [Time Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slot_date
 *               - start_time
 *               - end_time
 *               - duration
 *             properties:
 *               slot_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-10"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "10:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "11:00"
 *               duration:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       201:
 *         description: Time slot created
 *       400:
 *         description: Validation error or slot already exists
 *       403:
 *         description: Only providers can create slots
 */

/**
 * @swagger
 * /time-slots/{id}:
 *   get:
 *     summary: Get time slot by ID
 *     tags: [Time Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Time slot details
 *       404:
 *         description: Time slot not found
 *   put:
 *     summary: Update time slot (provider only)
 *     tags: [Time Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slot_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               duration:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Time slot updated
 *       400:
 *         description: Cannot update booked slot
 *       403:
 *         description: Not authorized
 *   delete:
 *     summary: Delete time slot (provider only)
 *     tags: [Time Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Time slot deleted
 *       400:
 *         description: Cannot delete booked slot
 *       403:
 *         description: Not authorized
 */
