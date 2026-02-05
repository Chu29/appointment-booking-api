import Joi from "joi";
import logger from "../../../utils/logger.js";

const registrationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Must be a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),

  role: Joi.string().valid("client", "provider").required().messages({
    "string.empty": "Role is required",
    "any.only": "Role must be either 'client' or 'provider'",
    "any.required": "Role is required",
  }),
});

export const validateRegistration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body, {
    abortEarly: false, // if true, stops validation on first error otherwise returns all errors
  });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    logger.warn("Validation failed", { errors });

    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

  next();
};
