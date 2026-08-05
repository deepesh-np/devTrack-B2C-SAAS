import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { fetchCodeforcesData, fetchLeetCodeData, unavailablePlatformData, type CodingPlatformData, type PlatformKey } from "../services/codingPlatformService.js";

export const getMyCodingPlatforms = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized." });
    const profile = await prisma.profile.findUnique({ where: { userId: (req.user as any).id } });
    if (!profile) return res.json({ success: true, platforms: [], validationErrors: {} });
    const jobs: Array<{ platform: PlatformKey; request: Promise<CodingPlatformData> }> = [];
    if (profile.leetcodeUsername) jobs.push({ platform: "leetcode", request: fetchLeetCodeData(profile.leetcodeUsername) });
    if (profile.codeforcesUsername) jobs.push({ platform: "codeforces", request: fetchCodeforcesData(profile.codeforcesUsername) });
    if (profile.codechefUsername) jobs.push({ platform: "codechef", request: Promise.resolve(unavailablePlatformData("codechef", profile.codechefUsername)) });
    if (profile.atcoderUsername) jobs.push({ platform: "atcoder", request: Promise.resolve(unavailablePlatformData("atcoder", profile.atcoderUsername)) });
    const results = await Promise.allSettled(jobs.map((job) => job.request));
    const platforms: CodingPlatformData[] = [];
    const validationErrors: Partial<Record<PlatformKey, string>> = {};
    results.forEach((result, index) => {
      if (result.status === "fulfilled") platforms.push(result.value);
      else validationErrors[jobs[index].platform] = result.reason?.message ?? "Unable to verify this username";
    });
    return res.json({ success: true, platforms, validationErrors });
  } catch (error) { next(error); }
};