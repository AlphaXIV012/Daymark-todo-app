export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode ?? err.status ?? 500;
  let message = err.message || "Internal server error";

  // PostgreSQL unique-constraint violation.
  if (err.code === "23505") {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  // Malformed JSON sent to express.json().
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body contains invalid JSON";
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  if (statusCode >= 500) {
    console.error(err);
    message = process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message;
  }

  const response = { success: false, message };
  if (err.errors) response.errors = err.errors;
  if (process.env.NODE_ENV !== "production" && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}
