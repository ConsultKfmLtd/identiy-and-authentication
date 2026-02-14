import { Router } from "express";
import { authLimiter } from "../middleware/rateLimit.js";
import { register, login, refresh, logoutHandler } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.post("/refresh", authLimiter, refresh);
authRouter.post("/logout", logoutHandler);
