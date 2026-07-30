export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  html_url: string;
  homepage: string | null;
  topics: string[];
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

export interface ContributionStats {
  totalContributions: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalRepos: number;
  weeks: Array<{
    contributionDays: ContributionDay[];
  }>;
}

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export interface PinnedRepo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
}

export interface GitHubData {
  profile: GitHubProfile | null;
  repos: GitHubRepo[] | null;
  contributionStats: ContributionStats | null;
  languageStats: LanguageStat[] | null;
  pinnedRepos: PinnedRepo[] | null;
}
