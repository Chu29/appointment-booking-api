import dotenv from "dotenv/config";
import createError from "http-errors";
import express, { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import registerRouter from "../src/modules/auth/auth_registration/registration.route.js";

const app = express();

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/auth", registerRouter);
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
