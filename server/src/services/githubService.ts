export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

import { config } from "../config/env.js";

const HEADERS = {
  "User-Agent": "DevTrack-App",
};

export async function fetchGitHubProfile(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`GitHub Profile fetch failed: ${res.statusText}`);
  const data: any = await res.json();
  return {
    login: data.login,
    name: data.name,
    bio: data.bio,
    avatar_url: data.avatar_url,
    location: data.location,
    company: data.company,
    blog: data.blog,
    public_repos: data.public_repos,
    followers: data.followers,
    following: data.following,
    created_at: data.created_at,
    html_url: data.html_url,
  };
}

export async function fetchPublicRepos(username: string) {
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=owner`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`GitHub Repos fetch failed: ${res.statusText}`);
  const repos: any[] = await res.json() as any[];
  return repos
    .filter((repo: any) => !repo.fork)
    .map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language,
      updated_at: repo.updated_at,
      html_url: repo.html_url,
      homepage: repo.homepage,
      topics: repo.topics || [],
    }));
}

export async function fetchContributionStats(username: string) {
  if (!config.githubPat) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalRepositoryContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...HEADERS,
      Authorization: `Bearer ${config.githubPat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  if (!res.ok) throw new Error(`GitHub Contributions fetch failed: ${res.statusText}`);
  const json: any = await res.json();
  const { data, errors } = json;
  if (errors) throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`);
  
  if (!data?.user?.contributionsCollection) return null;

  const cc = data.user.contributionsCollection;
  return {
    totalContributions: cc.contributionCalendar.totalContributions,
    totalCommits: cc.totalCommitContributions,
    totalPRs: cc.totalPullRequestContributions,
    totalIssues: cc.totalIssueContributions,
    totalRepos: cc.totalRepositoryContributions,
    weeks: cc.contributionCalendar.weeks,
  };
}

export async function fetchPinnedRepos(username: string) {
  if (!config.githubPat) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...HEADERS,
      Authorization: `Bearer ${config.githubPat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  if (!res.ok) throw new Error(`GitHub Pinned Repos fetch failed: ${res.statusText}`);
  const json: any = await res.json();
  const { data, errors } = json;
  if (errors) throw new Error(`GraphQL Errors: ${errors.map((e: any) => e.message).join(", ")}`);

  return data?.user?.pinnedItems?.nodes?.map((repo: any) => ({
    name: repo.name,
    description: repo.description,
    url: repo.url,
    stargazerCount: repo.stargazerCount,
    forkCount: repo.forkCount,
    primaryLanguage: repo.primaryLanguage,
  })) || [];
}

export async function fetchLanguageStats(username: string, repos: any[]) {
  const repoNames = repos.slice(0, 10).map((r) => r.name);
  const langCounts: Record<string, number> = {};
  
  for (const repoName of repoNames) {
    try {
      const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/languages`, {
        headers: HEADERS,
      });
      if (res.ok) {
        const data: Record<string, number> = await res.json() as Record<string, number>;
        for (const [lang, bytes] of Object.entries(data)) {
          langCounts[lang] = (langCounts[lang] || 0) + (bytes as number);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch languages for ${repoName}:`, err);
    }
  }

  const totalBytes = Object.values(langCounts).reduce((sum, bytes) => sum + bytes, 0);
  
  if (totalBytes === 0) return [];

  const stats = Object.entries(langCounts)
    .map(([name, bytes]) => ({
      name,
      percentage: Number(((bytes / totalBytes) * 100).toFixed(2)),
      color: LANGUAGE_COLORS[name] || "#cccccc",
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return stats;
}

export async function fetchFullGitHubData(username: string) {
  let profile = null;
  let repos: any = [];
  let contributionStats = null;
  let languageStats = null;
  let pinnedRepos = null;

  const profilePromise = fetchGitHubProfile(username);
  const reposPromise = fetchPublicRepos(username);
  const statsPromise = fetchContributionStats(username);
  const pinnedPromise = fetchPinnedRepos(username);

  const [profileResult, reposResult, statsResult, pinnedResult] = await Promise.allSettled([
    profilePromise,
    reposPromise,
    statsPromise,
    pinnedPromise,
  ]);

  if (profileResult.status === "fulfilled") {
    profile = profileResult.value;
  } else {
    console.error("Failed to fetch profile:", profileResult.reason);
  }

  if (reposResult.status === "fulfilled") {
    repos = reposResult.value;
    try {
      languageStats = await fetchLanguageStats(username, repos);
    } catch (err) {
      console.error("Failed to fetch language stats:", err);
    }
  } else {
    console.error("Failed to fetch repos:", reposResult.reason);
  }

  if (statsResult.status === "fulfilled") {
    contributionStats = statsResult.value;
  } else {
    console.error("Failed to fetch contribution stats:", statsResult.reason);
  }

  if (pinnedResult.status === "fulfilled") {
    pinnedRepos = pinnedResult.value;
  } else {
    console.error("Failed to fetch pinned repos:", pinnedResult.reason);
  }

  return {
    profile,
    repos,
    contributionStats,
    languageStats,
    pinnedRepos,
  };
}
