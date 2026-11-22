import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw new AppError("Authentication required", 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  let payload;
  try {
    payload = jwt.verify(match[1], secret, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    !/^\d+$/.test(payload.sub)
  ) {
    throw new AppError("Invalid access token", 401);
  }

  const user = await userRepository.findById(Number(payload.sub));
  if (!user) {
    throw new AppError("Invalid or expired access token", 401);
  }

  // The database is the source of truth for the user's current role.
  req.user = user;
  next();
});
