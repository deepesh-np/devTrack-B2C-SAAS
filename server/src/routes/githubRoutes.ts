import { Router } from "express";
import { getMyGitHubData, getPublicGitHubData } from "../controllers/githubController.js";
import { authenticateJwt } from "../middleware/auth.js";

const router = Router();

// Protected route to get own GitHub data
router.get("/me", authenticateJwt, getMyGitHubData);

// Public route to view another user's GitHub data
router.get("/user/:username", getPublicGitHubData);

export default router;
