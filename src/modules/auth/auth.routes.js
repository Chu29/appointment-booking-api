import { Router } from "express";
import { registrationHandler } from "./auth.controller.js";
import { validateRegistration } from "./auth.validation.js";

const router = Router();

// POST /auth/register - Register a new user
router.post("/register", validateRegistration, registrationHandler);

export default router;
