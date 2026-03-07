import crypto from "crypto";
import { prisma } from "@partygbe/db";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { v4 as uuidv4 } from "uuid";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function registerUser(input: { email: string; password: string; username?: string }) {
  const email = input.email.toLowerCase().trim();


  const existing = await prisma.users.findFirst({ where: { email } });
  if (existing) {
    const err: any = new Error("Email already in use");
    err.status = 409;
    err.code = "EMAIL_TAKEN";
    throw err;
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.users.create({
    data: { 
      id: uuidv4(),
      full_name: "",
      username: input.username?.trim() ?? "",
      email: email,
      password_hash:passwordHash,
      profile_photo_url: ""
    }
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  const refreshTokenHash = sha256(refreshToken);

  return {
    user: { id: user.id, email: user.email, name: user.username, createdAt: Date.now() },
    accessToken,
    refreshToken
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {
    const err: any = new Error("Invalid credentials");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const ok = await verifyPassword(input.password, user.password_hash);
  if (!ok) {
    const err: any = new Error("Invalid credentials");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });

  const refreshTokenHash = sha256(refreshToken);

  return {
    user: { id: user.id, email: user.email, name: user.username, createdAt: user.created_at },
    accessToken,
    refreshToken
  };
}

export async function refreshSession(input: { refreshToken: string }) {
  const decoded = verifyRefreshToken(input.refreshToken);
  const tokenHash = sha256(input.refreshToken);

  return { accessToken: "newAccessToken", refreshToken: "newRefreshToken" };
}

export async function logout(input: { refreshToken: string }) {
  const tokenHash = sha256(input.refreshToken);
}

export async function changePassword(input: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) {
  const email = input.email.toLowerCase().trim();

  const user = await prisma.users.findFirst({
    where: { email }
  });

  if (!user) {
    const err: any = new Error("Invalid email or password");
    err.status = 400;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }

  const oldPasswordMatches = await verifyPassword(
    input.oldPassword,
    user.password_hash
  );

  if (!oldPasswordMatches) {
    const err: any = new Error("Old password is incorrect");
    err.status = 400;
    err.code = "INVALID_UPDATE_PASSWORD";
    throw err;
  }

  const samePassword = await verifyPassword(
    input.newPassword,
    user.password_hash
  );

  if (samePassword) {
    const err: any = new Error("New password must be different from old password");
    err.status = 400;
    err.code = "PASSWORD_UNCHANGED";
    throw err;
  }

  const newPasswordHash = await hashPassword(input.newPassword);

  await prisma.users.update({
    where: { id: user.id },
    data: {
      password_hash: newPasswordHash
    }
  });

  return {
    message: "Password updated successfully"
  };
}
