export type TargetCompany =
  | 'FAANG'
  | 'MAANG'
  | 'MICROSOFT'
  | 'ADOBE'
  | 'ATLASSIAN'
  | 'UBER'
  | 'STARTUP'
  | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  avatar?: string | null;
  provider: string;
  createdAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string | null;
  headline?: string | null;
  githubUsername?: string | null;
  leetcodeUsername?: string | null;
  codeforcesUsername?: string | null;
  codechefUsername?: string | null;
  atcoderUsername?: string | null;
  resumeUrl?: string | null;
  college?: string | null;
  degree?: string | null;
  graduationYear?: number | null;
  currentCompany?: string | null;
  targetCompany?: TargetCompany | null;
  dailyGoal: number;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  errors?: Record<string, string[]>;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  profile?: Profile;
  errors?: Record<string, string[]>;
}

export interface ApiLog {
  id: string;
  time: string;
  method: string;
  endpoint: string;
  status: number;
  data: any;
}

export type CodingPlatform = 'leetcode' | 'codeforces' | 'codechef' | 'atcoder';
export interface CodingPlatformData {
  platform: CodingPlatform;
  username: string;
  profileUrl: string;
  verified: boolean;
  rating: number | null;
  solvedProblems: number | null;
  contestHistory: Array<{ name: string; rating: number | null; date: string }>;
  lastUpdated: string;
  message?: string;
}