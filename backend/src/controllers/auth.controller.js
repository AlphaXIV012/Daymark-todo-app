import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  return res.status(201).json({
    success: true,
    message: "Account created successfully. Please log in.",
    data: { user },
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
});
