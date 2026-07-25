import { z } from 'zod'
import prisma from "../lib/prisma.js";

export const profileSchema = z.object({
  githubUsername: z
    .string()
    .trim()
    .min(1)
    .max(39)
    .optional(),

  leetcodeUsername: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .optional(),

  codeforcesUsername: z
    .string()
    .trim()
    .optional(),

  codechefUsername: z
    .string()
    .trim()
    .optional(),

  atcoderUsername: z
    .string()
    .trim()
    .optional(),

  college: z
    .string()
    .trim()
    .max(100)
    .optional(),

  degree: z
    .string()
    .trim()
    .max(50)
    .optional(),

  graduationYear: z
    .number()
    .int()
    .min(2000)
    .max(2100)
    .optional(),

  currentCompany: z
    .string()
    .trim()
    .max(100)
    .optional(),

  headline: z
    .string()
    .trim()
    .max(80)
    .optional(),

  bio: z
    .string()
    .trim()
    .max(500)
    .optional(),

  city: z
    .string()
    .trim()
    .max(50)
    .optional(),

  country: z
    .string()
    .trim()
    .max(50)
    .optional(),

  targetCompany: z.enum([
    "FAANG",
    "MAANG",
    "MICROSOFT",
    "ADOBE",
    "ATLASSIAN",
    "UBER",
    "STARTUP",
    "OTHER",
  ]).optional(),

  dailyQuestionGoal: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;