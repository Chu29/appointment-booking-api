import { Router } from "express";
import { registrationHandler } from "./registration.controller.js";
import { validateRegistration } from "./registration.validation.js";

const router = Router();

// POST /auth/register - Register a new user
router.post("/register", validateRegistration, registrationHandler);

export default router;
