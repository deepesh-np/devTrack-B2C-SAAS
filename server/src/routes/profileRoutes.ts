import { Router } from "express";
import { createProfile } from "../controllers/profileController.js";
import { authenticateJwt } from "../middleware/auth.js";

const router = Router();

// Protect profile creation with Passport JWT middleware
router.post("/new", authenticateJwt, createProfile);

export default router;