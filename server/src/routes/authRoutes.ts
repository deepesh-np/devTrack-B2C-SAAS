import { Router } from "express";
import {
  register,
  login,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  getMe,
  logout,
} from "../controllers/authController.js";
import { authenticateJwt } from "../middleware/auth.js";

const router = Router();

// Local Auth Routes (Username/Email + Password)
router.post("/register", register);
router.post("/login", login);

// Passport Google OAuth Routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Passport GitHub OAuth Routes
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);

// Authenticated User Routes (Protected via Passport JWT)
router.get("/me", authenticateJwt, getMe);
router.post("/logout", logout);

export default router;
