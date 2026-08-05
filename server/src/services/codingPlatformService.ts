export type PlatformKey = "leetcode" | "codeforces" | "codechef" | "atcoder";

export interface CodingPlatformData {
  platform: PlatformKey;
  username: string;
  profileUrl: string;
  verified: boolean;
  rating: number | null;
  solvedProblems: number | null;
  contestHistory: Array<{ name: string; rating: number | null; date: string }>;
  lastUpdated: string;
  message?: string;
}

const now = () => new Date().toISOString();

const unavailable = (platform: PlatformKey, username: string, profileUrl: string, message: string): CodingPlatformData => ({
  platform, username, profileUrl, verified: false, rating: null, solvedProblems: null,
  contestHistory: [], lastUpdated: now(), message,
});

export async function fetchLeetCodeData(username: string): Promise<CodingPlatformData> {
  const profileUrl = `https://leetcode.com/u/${encodeURIComponent(username)}/`;
  const query = `query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      userContestRanking { rating attendedContestsCount }
      userContestRankingHistory(username: $username) { attended rating contest { title startTime } }
    }
  }`;
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "DevTrack-App" },
    body: JSON.stringify({ query, variables: { username } }),
  });
  if (!response.ok) throw new Error("LeetCode is temporarily unavailable");
  const json: any = await response.json();
  const user = json?.data?.matchedUser;
  if (!user) throw new Error("LeetCode username was not found");
  const accepted = user.submitStatsGlobal?.acSubmissionNum ?? [];
  const total = accepted.find((item: any) => item.difficulty === "All")?.count ?? 0;
  const contests = (user.userContestRankingHistory ?? []).filter((contest: any) => contest.attended).slice(-5).reverse().map((contest: any) => ({
    name: contest.contest?.title ?? 'LeetCode contest', rating: contest.rating ? Math.round(contest.rating) : null,
    date: contest.contest?.startTime ? new Date(contest.contest.startTime * 1000).toISOString() : now(),
  }));
  return { platform: "leetcode", username: user.username, profileUrl, verified: true,
    rating: user.userContestRanking?.rating ? Math.round(user.userContestRanking.rating) : null,
    solvedProblems: total, contestHistory: contests, lastUpdated: now() };
}

export async function fetchCodeforcesData(username: string): Promise<CodingPlatformData> {
  const profileUrl = `https://codeforces.com/profile/${encodeURIComponent(username)}`;
  const [infoResponse, statusResponse, ratingResponse] = await Promise.all([
    fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`),
    fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=10000`),
    fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(username)}`),
  ]);
  const [info, status, rating]: any[] = await Promise.all([infoResponse.json(), statusResponse.json(), ratingResponse.json()]);
  if (info.status !== "OK") throw new Error("Codeforces username was not found");
  const solved = new Set((status.result ?? []).filter((submission: any) => submission.verdict === "OK")
    .map((submission: any) => `${submission.problem?.contestId ?? "gym"}-${submission.problem?.index ?? submission.problem?.name}`));
  const contests = rating.status === "OK" ? rating.result.slice(-5).reverse().map((contest: any) => ({
    name: contest.contestName, rating: contest.newRating ?? null,
    date: new Date(contest.ratingUpdateTimeSeconds * 1000).toISOString(),
  })) : [];
  return { platform: "codeforces", username: info.result[0].handle, profileUrl, verified: true,
    rating: info.result[0].rating ?? null, solvedProblems: solved.size, contestHistory: contests, lastUpdated: now() };
}

export function unavailablePlatformData(platform: "codechef" | "atcoder", username: string): CodingPlatformData {
  const profileUrl = platform === "codechef" ? `https://www.codechef.com/users/${encodeURIComponent(username)}` : `https://atcoder.jp/users/${encodeURIComponent(username)}`;
  return unavailable(platform, username, profileUrl, "Live stats are not available yet; open the public profile to verify this handle.");
}