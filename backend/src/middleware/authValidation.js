import AppError from "../utils/AppError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireObjectBody(req) {
  return req.body && typeof req.body === "object" && !Array.isArray(req.body);
}

export function validateRegister(req, res, next) {
  if (!requireObjectBody(req)) {
    return next(new AppError("Request body must be a JSON object", 400));
  }

  const { email, password } = req.body;
  const errors = [];

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.push({ field: "email", message: "A valid email address is required" });
  } else if (email.trim().length > 255) {
    errors.push({ field: "email", message: "Email cannot exceed 255 characters" });
  }

  if (typeof password !== "string" || password.length < 12) {
    errors.push({ field: "password", message: "Password must be at least 12 characters" });
  } else if (Buffer.byteLength(password, "utf8") > 1024) {
    errors.push({ field: "password", message: "Password is too long" });
  }

  if (errors.length) {
    return next(new AppError("Validation failed", 400, errors));
  }

  next();
}

export function validateLogin(req, res, next) {
  if (!requireObjectBody(req)) {
    return next(new AppError("Request body must be a JSON object", 400));
  }

  const { email, password } = req.body;
  const errors = [];

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    errors.push({ field: "email", message: "A valid email address is required" });
  }

  if (typeof password !== "string" || password.length === 0) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (Buffer.byteLength(password, "utf8") > 1024) {
    errors.push({ field: "password", message: "Password is too long" });
  }

  if (errors.length) {
    return next(new AppError("Validation failed", 400, errors));
  }

  next();
}
