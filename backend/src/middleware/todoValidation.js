import AppError from "../utils/AppError.js";

function isObjectBody(body) {
  return body && typeof body === "object" && !Array.isArray(body);
}

export function validateCreateTodo(req, res, next) {
  if (!isObjectBody(req.body)) {
    return next(new AppError("Request body must be a JSON object", 400));
  }

  const { task } = req.body;
  const errors = [];

  if (typeof task !== "string" || !task.trim()) {
    errors.push({ field: "task", message: "A non-empty task is required" });
  } else if (task.trim().length > 200) {
    errors.push({ field: "task", message: "Task cannot exceed 200 characters" });
  }

  const unexpectedFields = Object.keys(req.body).filter((key) => key !== "task");
  if (unexpectedFields.length) {
    errors.push({ field: "body", message: `Unexpected fields: ${unexpectedFields.join(", ")}` });
  }

  if (errors.length) return next(new AppError("Validation failed", 400, errors));
  next();
}

export function validateUpdateTodo(req, res, next) {
  if (!isObjectBody(req.body)) {
    return next(new AppError("Request body must be a JSON object", 400));
  }

  const allowedFields = ["task", "completed"];
  const fields = Object.keys(req.body);
  const errors = [];

  if (!fields.length) {
    errors.push({ field: "body", message: "Provide at least one field to update" });
  }

  const unexpectedFields = fields.filter((key) => !allowedFields.includes(key));
  if (unexpectedFields.length) {
    errors.push({ field: "body", message: `Unexpected fields: ${unexpectedFields.join(", ")}` });
  }

  if (req.body.task !== undefined) {
    if (typeof req.body.task !== "string" || !req.body.task.trim()) {
      errors.push({ field: "task", message: "Task must be a non-empty string" });
    } else if (req.body.task.trim().length > 200) {
      errors.push({ field: "task", message: "Task cannot exceed 200 characters" });
    }
  }

  if (req.body.completed !== undefined && typeof req.body.completed !== "boolean") {
    errors.push({ field: "completed", message: "Completed must be a boolean" });
  }

  if (errors.length) return next(new AppError("Validation failed", 400, errors));
  next();
}
