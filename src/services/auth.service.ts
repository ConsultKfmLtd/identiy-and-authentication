import crypto from "crypto";
import { prisma } from "@partygbe/db";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { env } from "../config/env.js";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function registerUser(input: { email: string; password: string; username?: string }) {
  const email = input.email.toLowerCase().trim();

  console.log("prisma is:", prisma);
  console.log("prisma.users is:", (prisma as any)?.users);

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    const err: any = new Error("Email already in use");
    err.status = 409;
    err.code = "EMAIL_TAKEN";
    throw err;
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.users.create({
    data: { 
      full_name: "",
      username: input.username?.trim(),
      email: email,
      password_hash:passwordHash
    }
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  const refreshTokenHash = sha256(refreshToken);
  // TODO: create prisma model for refresh token
  // await prisma.refreshToken.create({
  //   data: {
  //     tokenHash: refreshTokenHash,
  //     userId: user.id,
  //     expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000)
  //   }
  // });

  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    accessToken,
    refreshToken
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    const err: any = new Error("Invalid credentials");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    const err: any = new Error("Invalid credentials");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  const refreshTokenHash = sha256(refreshToken);
  // await prisma.refreshToken.create({
  //   data: {
  //     tokenHash: refreshTokenHash,
  //     userId: user.id,
  //     expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000)
  //   }
  // });

  return {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    accessToken,
    refreshToken
  };
}

export async function refreshSession(input: { refreshToken: string }) {
  const decoded = verifyRefreshToken(input.refreshToken);
  const tokenHash = sha256(input.refreshToken);

  // const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  // if (!stored || stored.revokedAt) {
  //   const err: any = new Error("Refresh token invalid");
  //   err.status = 401;
  //   err.code = "INVALID_REFRESH_TOKEN";
  //   throw err;
  // }

  // if (stored.expiresAt.getTime() < Date.now()) {
  //   const err: any = new Error("Refresh token expired");
  //   err.status = 401;
  //   err.code = "EXPIRED_REFRESH_TOKEN";
  //   throw err;
  // }

  // // Optional: rotate refresh tokens (recommended)
  // await prisma.refreshToken.update({
  //   where: { tokenHash },
  //   data: { revokedAt: new Date() }
  // });

  // const user = await prisma.users.findUnique({ where: { id: decoded.sub } });
  // if (!user) {
  //   const err: any = new Error("User not found");
  //   err.status = 404;
  //   err.code = "USER_NOT_FOUND";
  //   throw err;
  // }

  // const accessToken = signAccessToken({ sub: user.id, email: user.email });
  // const newRefreshToken = signRefreshToken({ sub: user.id });

  // await prisma.refreshToken.create({
  //   data: {
  //     tokenHash: sha256(newRefreshToken),
  //     userId: user.id,
  //     expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_SECONDS * 1000)
  //   }
  // });

  return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" };
}

export async function logout(input: { refreshToken: string }) {
  const tokenHash = sha256(input.refreshToken);
  // const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  // if (!stored) return;

  // await prisma.refreshToken.update({
  //   where: { tokenHash },
  //   data: { revokedAt: new Date() }
  // });
}
