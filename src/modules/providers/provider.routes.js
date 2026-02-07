import { Router } from "express";
import {
  getMyProfile,
  getProviders,
  updateProfile,
} from "./provider.controller.js";
import { validateUpdateProvider } from "./provider.validation.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../../middleware/auth.middleware.js";

const router = Router();

// GET /providers - Get all providers (accessible to all authenticated users)
router.get("/", authenticateToken, getProviders);

// GET /providers/profile - Get current provider's profile (providers only)
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("provider"),
  getMyProfile,
);

// PUT /providers/profile - Update provider profile (providers only)
router.put(
  "/profile",
  authenticateToken,
  authorizeRoles("provider"),
  validateUpdateProvider,
  updateProfile,
);

export default router;
