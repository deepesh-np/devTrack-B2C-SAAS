import { Router } from "express";
import {
  getProfile,
  createProfile,
  updateProfile,
  getPublicProfile,
} from "../controllers/profileController.js";
import { authenticateJwt } from "../middleware/auth.js";

const router = Router();

// Protected profile routes
router.get("/me", authenticateJwt, getProfile);
router.post("/new", authenticateJwt, createProfile);
router.put("/update", authenticateJwt, updateProfile);
router.patch("/update", authenticateJwt, updateProfile);

// Public route to view profile by username
router.get("/user/:username", getPublicProfile);

export default router;