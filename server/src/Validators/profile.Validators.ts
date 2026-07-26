import { z } from 'zod';

export const profileSchema = z.object({
  githubUsername: z.string().trim().min(1).max(39).optional().nullable(),
  leetcodeUsername: z.string().trim().min(1).max(30).optional().nullable(),
  codeforcesUsername: z.string().trim().optional().nullable(),
  codechefUsername: z.string().trim().optional().nullable(),
  atcoderUsername: z.string().trim().optional().nullable(),
  college: z.string().trim().max(100).optional().nullable(),
  degree: z.string().trim().max(50).optional().nullable(),
  graduationYear: z.number().int().min(2000).max(2100).optional().nullable(),
  currentCompany: z.string().trim().max(100).optional().nullable(),
  headline: z.string().trim().max(80).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  targetCompany: z.enum([
    "FAANG",
    "MAANG",
    "MICROSOFT",
    "ADOBE",
    "ATLASSIAN",
    "UBER",
    "STARTUP",
    "OTHER",
  ]).optional().nullable(),
  dailyGoal: z.number().int().min(1).max(20).optional(),
  dailyQuestionGoal: z.number().int().min(1).max(20).optional(),
});

export const updateProfileSchema = profileSchema.partial();

export type ProfileInput = z.infer<typeof profileSchema>;