import { Router } from "express";
import { registrationHandler, loginHandler } from "./auth.controller.js";
import { validateRegistration, validateLogin } from "./auth.validation.js";

const router = Router();

// POST /auth/register - Register a new user
router.post("/register", validateRegistration, registrationHandler);

// POST /auth/login - Authenticate user and get JWT token
router.post("/login", validateLogin, loginHandler);

export default router;
