import argon2 from "argon2";
import jwt from "jsonwebtoken";
import * as userRepository from "../repositories/user.repository.js";
import AppError from "../utils/AppError.js";

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    ...(user.createdAt ? { createdAt: user.createdAt } : {}),
  };
}

function createAccessToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");

  return jwt.sign(
    {},
    secret,
    {
      algorithm: "HS256",
      subject: String(user.id),
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    }
  );
}

export async function registerUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  // The database UNIQUE constraint remains the final protection against race conditions.
  try {
    const user = await userRepository.createUser({
      email: normalizedEmail,
      passwordHash,
    });
    return publicUser(user);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("Email already registered", 409);
    }
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  // Use the same message whether the email or password is incorrect.
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordIsValid = await argon2.verify(user.passwordHash, password);
  if (!passwordIsValid) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    accessToken: createAccessToken(user),
    tokenType: "Bearer",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    user: publicUser(user),
  };
}
