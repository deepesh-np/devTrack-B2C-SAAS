import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { fetchFullGitHubData } from "../services/githubService.js";

export const getMyGitHubData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const userId = (req.user as any).id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.githubUsername) {
      return res.status(400).json({
        success: false,
        message: "GitHub username not set in profile.",
      });
    }

    const data = await fetchFullGitHubData(profile.githubUsername);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicGitHubData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const username = req.params.username as string;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile || !profile.githubUsername) {
      return res.status(404).json({
        success: false,
        message: "Profile or GitHub username not found.",
      });
    }

    const data = await fetchFullGitHubData(profile.githubUsername);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
