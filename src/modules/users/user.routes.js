import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "./user.controller.js";
import {
  validateUpdateProfile,
  validateChangePassword,
} from "./user.validation.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /users/profile - Get current user profile
router.get("/profile", getProfile);

// PUT /users/profile - Update current user profile
router.put("/profile", validateUpdateProfile, updateProfile);

// PUT /users/password - Change password
router.put("/password", validateChangePassword, changePassword);

// DELETE /users/profile - Delete user account
router.delete("/profile", deleteAccount);

export default router;
