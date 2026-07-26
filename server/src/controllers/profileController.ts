import { Request, Response, NextFunction } from "express";
import { profileSchema, updateProfileSchema } from "../Validators/profile.Validators.js";
import prisma from "../lib/prisma.js";

/**
 * Get current user's profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User session or token is missing.",
      });
    }

    const userId = (req.user as any).id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            provider: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create profile
 */
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = profileSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const { dailyQuestionGoal, dailyGoal, ...restData } = result.data;
  const goal = dailyGoal ?? dailyQuestionGoal ?? 3;

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User session or token is missing.",
      });
    }

    const userId = (req.user as any).id;

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists. Use update endpoint instead.",
      });
    }

    const profile = await prisma.profile.create({
      data: {
        userId,
        ...restData,
        dailyGoal: goal,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            provider: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Profile created successfully.",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile (or upsert)
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const result = updateProfileSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  const { dailyQuestionGoal, dailyGoal, ...restData } = result.data;

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User session or token is missing.",
      });
    }

    const userId = (req.user as any).id;

    const updatePayload: any = { ...restData };
    if (dailyGoal !== undefined || dailyQuestionGoal !== undefined) {
      updatePayload.dailyGoal = dailyGoal ?? dailyQuestionGoal;
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: updatePayload,
      create: {
        userId,
        ...updatePayload,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
            provider: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Public Profile by Username
 */
export const getPublicProfile = async (
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
      include: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "User or profile not found.",
      });
    }

    const { password, ...publicUser } = user;

    return res.status(200).json({
      success: true,
      user: publicUser,
    });
  } catch (error) {
    next(error);
  }
};