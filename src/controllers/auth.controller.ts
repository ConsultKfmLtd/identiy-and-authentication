import type { Request, Response } from "express";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validators.js";
import { registerUser, loginUser, refreshSession, logout } from "../services/auth.service.js";
import { env } from "../config/env.js";

/*
  This file contains the controller functions for authentication-related operations, such as registration, login, token refresh, and logout. 
  Each function handles and validated the corresponding HTTP request, interacts with the service layer to perform the necessary business logic, and sends an appropriate response back to the client. 
  The controller also manages setting and clearing cookies for refresh tokens when needed.
*/
function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax" as const,
    path: "/",
    maxAge: env.REFRESH_TOKEN_TTL_SECONDS * 1000
  };
}

// Access token returns in JSON; refresh token in cookie (safer than localStorage).

export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);
  const result = await registerUser(body);

  res.cookie("refresh_token", result.refreshToken, cookieOptions());

  return res.status(201).json({
    user: result.user,
    accessToken: result.accessToken
  });
}

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);
  const result = await loginUser(body);

  res.cookie("refresh_token", result.refreshToken, cookieOptions());

  return res.status(200).json({
    user: result.user,
    accessToken: result.accessToken
  });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token ?? req.body?.refreshToken;
  const body = refreshSchema.parse({ refreshToken: token });

  const result = await refreshSession(body);

  res.cookie("refresh_token", result.refreshToken, cookieOptions());

  return res.status(200).json({ accessToken: result.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const token = req.cookies?.refresh_token ?? req.body?.refreshToken;
  if (token) await logout({ refreshToken: token });

  res.clearCookie("refresh_token", { path: "/" });
  return res.status(204).send();
}
