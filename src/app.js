import dotenv from "dotenv/config";
import createError from "http-errors";
import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import authRouter from "../src/modules/auth/auth.routes.js";
import userRouter from "../src/modules/users/user.routes.js";
import providerRouter from "../src/modules/providers/provider.routes.js";
import timeSlotRouter from "../src/modules/timeSlots/timeSlot.routes.js";
import appointmentRouter from "../src/modules/appointments/appointment.routes.js";

const app = express();

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Appointment Booking API Docs"
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/providers", providerRouter);
app.use("/time-slots", timeSlotRouter);
app.use("/appointments", appointmentRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode,
    message: err.message,
    error: req.app.get("env") === "development" ? err.stack : {},
  });
});

export default app;
