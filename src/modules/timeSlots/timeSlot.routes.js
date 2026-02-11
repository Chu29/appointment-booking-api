import { Router } from "express";
import {
  createSlot,
  getMySlots,
  getAvailableSlots,
  updateSlot,
  deleteSlot,
} from "./timeSlot.controller.js";
import {
  validateCreateTimeSlot,
  validateUpdateTimeSlot,
} from "./timeSlot.validation.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../../middleware/auth.middleware.js";

const router = Router();

// POST /time-slots - Create time slot (providers only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("provider"),
  validateCreateTimeSlot,
  createSlot,
);

// GET /time-slots/my-slots - Get provider's own time slots (providers only)
router.get(
  "/my-slots",
  authenticateToken,
  authorizeRoles("provider"),
  getMySlots,
);

// GET /time-slots/available/:providerId - Get available slots for a provider (authenticated users)
router.get("/available/:providerId", authenticateToken, getAvailableSlots);

// PUT /time-slots/:slotId - Update time slot (providers only)
router.put(
  "/:slotId",
  authenticateToken,
  authorizeRoles("provider"),
  validateUpdateTimeSlot,
  updateSlot,
);

// DELETE /time-slots/:slotId - Delete time slot (providers only)
router.delete(
  "/:slotId",
  authenticateToken,
  authorizeRoles("provider"),
  deleteSlot,
);

export default router;
