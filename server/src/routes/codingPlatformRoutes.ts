import { Router } from "express";
import { getMyCodingPlatforms } from "../controllers/codingPlatformController.js";
import { authenticateJwt } from "../middleware/auth.js";
const router = Router();
router.get("/me", authenticateJwt, getMyCodingPlatforms);
export default router;