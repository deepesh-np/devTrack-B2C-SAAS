import { Request, Response, NextFunction } from "express";
import { profileSchema } from "../Validators/profile.Validators.js";
import prisma from "../lib/prisma.js";

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

  const data = result.data;

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User session or token is missing.",
      });
    }

    const userId = req.user.id;

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists.",
      });
    }

    const profile = await prisma.profile.create({
      data: {
        userId,
        ...data,
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