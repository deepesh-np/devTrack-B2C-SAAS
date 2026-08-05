import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { CodingPlatformData } from '../types';
import type { GitHubData } from '../types/github';

const platformLabels = { leetcode: 'LeetCode', codeforces: 'Codeforces', codechef: 'CodeChef', atcoder: 'AtCoder' } as const;
const platformUrls = {
  leetcode: (name: string) => `https://leetcode.com/u/${name}/`,
  codeforces: (name: string) => `https://codeforces.com/profile/${name}`,
  codechef: (name: string) => `https://www.codechef.com/users/${name}`,
  atcoder: (name: string) => `https://atcoder.jp/users/${name}`,
};

function profileCompletion(profile: ReturnType<typeof useAuth>['profile']) {
  if (!profile) return 0;
  const values = [profile.headline, profile.bio, profile.githubUsername, profile.leetcodeUsername, profile.codeforcesUsername, profile.college, profile.degree, profile.resumeUrl];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

export const DashboardPage = () => {
  const { user, profile, setActiveView } = useAuth();
  const [github, setGithub] = useState<GitHubData | null>(null);
  const [platforms, setPlatforms] = useState<CodingPlatformData[]>([]);
  const [validationErrors, setValidationErrors] = useState<Partial<Record<CodingPlatformData['platform'], string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const [platformResult, githubResult] = await Promise.all([
        apiService.getMyCodingPlatforms(),
        profile.githubUsername ? apiService.getMyGitHubData() : Promise.resolve<{ success: boolean; data?: GitHubData }>({ success: false }),
      ]);
      if (platformResult.success) { setPlatforms(platformResult.platforms ?? []); setValidationErrors(platformResult.validationErrors ?? {}); }
      if (githubResult.success && githubResult.data) setGithub(githubResult.data);
      setLoading(false);
    };
    load();
  }, [profile?.githubUsername, profile?.leetcodeUsername, profile?.codeforcesUsername, profile?.codechefUsername, profile?.atcoderUsername]);

  const completion = profileCompletion(profile);
  const configuredPlatforms = useMemo(() => {
    const entries = [
      ['leetcode', profile?.leetcodeUsername], ['codeforces', profile?.codeforcesUsername],
      ['codechef', profile?.codechefUsername], ['atcoder', profile?.atcoderUsername],
    ] as const;
    return entries.filter(([, username]) => Boolean(username));
  }, [profile]);

  if (!user) return null;

  return <div className="dashboard-container">
    <section className="dashboard-hero">
      <div>
        <p className="dashboard-eyebrow">DEVELOPER DASHBOARD</p>
        <h1>Welcome back, {user.name?.split(' ')[0] || 'Developer'}.</h1>
        <p>Track the signals that matter for your next opportunity.</p>
      </div>
      <div className="completion-card">
        <div className="completion-ring" style={{ '--completion': `${completion * 3.6}deg` } as CSSProperties}><span>{completion}%</span></div>
        <div><strong>Profile completion</strong><p>Add your developer links to strengthen your profile.</p></div>
        <button className="text-action" onClick={() => setActiveView('profile')}>Edit profile</button>
      </div>
    </section>

    <section className="dashboard-stats" aria-label="GitHub summary">
      <article><span>Repositories</span><strong>{github?.profile?.public_repos ?? '--'}</strong><small>Public repositories</small></article>
      <article><span>Followers</span><strong>{github?.profile?.followers ?? '--'}</strong><small>GitHub followers</small></article>
      <article><span>Following</span><strong>{github?.profile?.following ?? '--'}</strong><small>Developers followed</small></article>
      <article><span>Contributions</span><strong>{github?.contributionStats?.totalContributions ?? '--'}</strong><small>Last 12 months</small></article>
    </section>

    <section className="dashboard-grid">
      <article className="dashboard-card github-overview">
        <div className="card-topline"><div><p className="section-kicker">GITHUB</p><h2>Developer profile</h2></div>{profile?.githubUsername && <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noreferrer">Open profile</a>}</div>
        {github?.profile ? <div className="github-summary">
          <img src={github.profile.avatar_url} alt="GitHub avatar" />
          <div><h3>{github.profile.name || github.profile.login}</h3><p>@{github.profile.login}</p><span>{github.profile.bio || 'No GitHub bio yet.'}</span></div>
        </div> : <div className="empty-state"><p>{loading ? 'Loading GitHub activity...' : 'Connect a GitHub username to see your activity.'}</p><button className="text-action" onClick={() => setActiveView('profile')}>Connect GitHub</button></div>}
        {github?.contributionStats?.weeks && <div className="contribution-block"><div className="card-topline"><strong>Contribution graph</strong><span>{github.contributionStats.totalContributions} this year</span></div><div className="dashboard-contribution-grid">{github.contributionStats.weeks.flatMap((week) => week.contributionDays).map((day) => <i key={day.date} data-level={day.contributionLevel} title={`${day.contributionCount} contributions on ${day.date}`} />)}</div></div>}
      </article>

      <article className="dashboard-card activity-card">
        <div className="card-topline"><div><p className="section-kicker">RECENT ACTIVITY</p><h2>Repository updates</h2></div></div>
        {github?.repos?.length ? <div className="activity-list">{github.repos.slice(0, 5).map((repo) => <a key={repo.html_url} href={repo.html_url} target="_blank" rel="noreferrer"><span className="activity-dot" /><div><strong>{repo.name}</strong><p>{repo.description || 'Updated repository'}</p></div><time>{new Date(repo.updated_at).toLocaleDateString()}</time></a>)}</div> : <div className="empty-state">{loading ? 'Loading recent activity...' : 'Your latest repositories will appear here.'}</div>}
      </article>
    </section>

    <section className="dashboard-grid bottom-grid">
      <article className="dashboard-card platform-card">
        <div className="card-topline"><div><p className="section-kicker">CODING PLATFORMS</p><h2>Practice footprint</h2></div><button className="text-action" onClick={() => setActiveView('profile')}>Manage</button></div>
        {configuredPlatforms.length ? <div className="platform-dashboard-list">{configuredPlatforms.map(([platform, username]) => {
          const data = platforms.find((item) => item.platform === platform);
          return <div key={platform} className="platform-dashboard-entry"><a href={data?.profileUrl || platformUrls[platform](username!)} target="_blank" rel="noreferrer"><div><strong>{platformLabels[platform]}</strong><span>@{username}</span></div><div className="platform-metrics"><b>{data?.rating ?? '-'}</b><small>rating</small><b>{data?.solvedProblems ?? '-'}</b><small>solved</small></div><em className={validationErrors[platform] ? 'invalid' : data?.verified ? 'verified' : 'pending'}>{validationErrors[platform] ? 'Invalid' : data?.verified ? 'Verified' : 'Pending'}</em></a>{validationErrors[platform] ? <p className="platform-error">{validationErrors[platform]}</p> : data?.contestHistory?.[0] ? <p className="contest-note">Latest: {data.contestHistory[0].name} - {data.contestHistory[0].rating ?? 'unrated'}</p> : <p className="contest-note">No contest history available</p>}</div>;
        })}</div> : <div className="empty-state"><p>Connect LeetCode, Codeforces, CodeChef, or AtCoder to track progress.</p><button className="text-action" onClick={() => setActiveView('profile')}>Add platforms</button></div>}
      </article>

      <article className="dashboard-card quick-links-card">
        <p className="section-kicker">QUICK LINKS</p><h2>Your developer presence</h2>
        <div className="quick-link-list">
          <a className={!profile?.githubUsername ? 'disabled' : ''} href={profile?.githubUsername ? `https://github.com/${profile.githubUsername}` : undefined} target="_blank" rel="noreferrer">GitHub <span>{profile?.githubUsername ? 'Open' : 'Not connected'}</span></a>
          <a className={!profile?.leetcodeUsername ? 'disabled' : ''} href={profile?.leetcodeUsername ? platformUrls.leetcode(profile.leetcodeUsername) : undefined} target="_blank" rel="noreferrer">LeetCode <span>{profile?.leetcodeUsername ? 'Open' : 'Not connected'}</span></a>
          <a className={!profile?.resumeUrl ? 'disabled' : ''} href={profile?.resumeUrl || undefined} target="_blank" rel="noreferrer">Resume <span>{profile?.resumeUrl ? 'Open' : 'Add link'}</span></a>
        </div>
      </article>
    </section>
  </div>;
};