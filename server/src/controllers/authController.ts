import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { registerSchema } from "../Validators/auth.Validators.js";
import passport from "../config/passport.js";
import prisma from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { config } from "../config/env.js";

// Cookie options for HTTP-only JWT storage
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @route POST /api/auth/register
 * @desc Register new local user with Username & Password
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: parseResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, username, password } = parseResult.data;
    const lowerEmail = email.toLowerCase();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await prisma.user.create({
      data: {
        name,
        email: lowerEmail,
        username,
        password: hashedPassword,
        provider: "LOCAL",
      },
    });

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    res.cookie("access_token", token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        provider: newUser.provider,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 * @desc Login user using Passport Local strategy (Username/Email + Password)
 */
export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid credentials",
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    res.cookie("access_token", token, COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  })(req, res, next);
};

/**
 * @route GET /api/auth/google
 * @desc Initiate Passport Google OAuth flow
 */
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

/**
 * @route GET /api/auth/google/callback
 * @desc Passport Google OAuth callback handler
 */
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "Google authentication failed",
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    res.cookie("access_token", token, COOKIE_OPTIONS);

    // If clientUrl is configured for frontend SPA, redirect with token
    if (req.accepts("html")) {
      return res.redirect(`${config.clientUrl}?token=${token}`);
    }

    return res.json({
      success: true,
      message: "Google authentication successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  })(req, res, next);
};

/**
 * @route GET /api/auth/github
 * @desc Initiate Passport GitHub OAuth flow
 */
export const githubAuth = passport.authenticate("github", {
  scope: ["user:email"],
  session: false,
});

/**
 * @route GET /api/auth/github/callback
 * @desc Passport GitHub OAuth callback handler
 */
export const githubCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("github", { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      return res.status(401).json({
        success: false,
        message: info?.message || "GitHub authentication failed",
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    res.cookie("access_token", token, COOKIE_OPTIONS);

    // If clientUrl is configured for frontend SPA, redirect with token
    if (req.accepts("html")) {
      return res.redirect(`${config.clientUrl}?token=${token}`);
    }

    return res.json({
      success: true,
      message: "GitHub authentication successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  })(req, res, next);
};

/**
 * @route GET /api/auth/me
 * @desc Get authenticated user profile (Protected by Passport JWT)
 */
export const getMe = (req: Request, res: Response) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

/**
 * @route POST /api/auth/logout
 * @desc Logout user and clear session cookies
 */
export const logout = (req: Request, res: Response) => {
  res.clearCookie("access_token");
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};
