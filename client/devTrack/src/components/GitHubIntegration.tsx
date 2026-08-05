import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { GitHubData } from '../types/github';

interface GitHubIntegrationProps {
  githubUsername: string;
}

// Time formatter
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({ githubUsername }) => {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.getMyGitHubData();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        // Fallback to public if myGitHubData fails or user is just viewing another profile
        const publicResult = await apiService.getPublicGitHubData(githubUsername);
        if (publicResult.success && publicResult.data) {
          setData(publicResult.data);
        } else {
          setError(publicResult.message || 'Failed to fetch GitHub data');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [githubUsername]);

  const renderSkeleton = () => (
    <div className="gh-section">
      <div className="gh-section-header">
        <div className="gh-section-icon">🐙</div>
        <h3>GitHub Activity</h3>
      </div>
      
      <div className="gh-profile-card">
        <div className="gh-skeleton-circle"></div>
        <div className="gh-profile-info">
          <div className="gh-skeleton-line" style={{ width: '150px', height: '20px' }}></div>
          <div className="gh-skeleton-line" style={{ width: '100px' }}></div>
          <div className="gh-skeleton-line" style={{ width: '100%', marginTop: '1rem' }}></div>
          <div className="gh-skeleton-line" style={{ width: '80%' }}></div>
        </div>
      </div>
      
      <div className="gh-stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="gh-stat-card">
            <div className="gh-skeleton-line" style={{ width: '30px', margin: '0 auto 10px' }}></div>
            <div className="gh-skeleton-line" style={{ width: '60px', margin: '0 auto 5px', height: '24px' }}></div>
            <div className="gh-skeleton-line" style={{ width: '80px', margin: '0 auto' }}></div>
          </div>
        ))}
      </div>
      
      <div className="gh-pinned-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="gh-pinned-card">
            <div className="gh-skeleton-line" style={{ width: '120px' }}></div>
            <div className="gh-skeleton-line" style={{ width: '100%', height: '40px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <div className="gh-section">
        <div className="gh-section-header">
          <div className="gh-section-icon">🐙</div>
          <h3>GitHub Activity</h3>
        </div>
        <div className="gh-error-card">
          <h4>Failed to load GitHub data</h4>
          <p>{error}</p>
          <button className="gh-retry-btn" onClick={fetchData}>
            <span>↻</span> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.profile) return null;

  const { profile, repos, contributionStats, languageStats, pinnedRepos } = data;
  const memberSinceYear = new Date(profile.created_at).getFullYear();

  // Helper to get day level for calendar
  const getLevel = (level: string) => {
    switch(level) {
      case 'FIRST_QUARTILE': return 1;
      case 'SECOND_QUARTILE': return 2;
      case 'THIRD_QUARTILE': return 3;
      case 'FOURTH_QUARTILE': return 4;
      default: return 0;
    }
  };

  return (
    <div className="gh-section">
      <div className="gh-section-header">
        <div className="gh-section-icon">🐙</div>
        <h3>GitHub Activity</h3>
      </div>

      {/* Section 1: Profile Card */}
      <div className="gh-profile-card">
        <img src={profile.avatar_url} alt={profile.login} className="gh-avatar" />
        <div className="gh-profile-info">
          <h4 className="gh-profile-name">{profile.name || profile.login}</h4>
          <div className="gh-profile-login">@{profile.login}</div>
          {profile.bio && <p className="gh-profile-bio">{profile.bio}</p>}
          
          <div className="gh-profile-meta">
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.company && <span>🏢 {profile.company}</span>}
            {profile.blog && (
              <span>🔗 <a href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} target="_blank" rel="noopener noreferrer">{profile.blog}</a></span>
            )}
          </div>
          
          <div className="gh-profile-stats">
            <span><strong>{profile.followers}</strong> followers</span>
            <span><strong>{profile.following}</strong> following</span>
            <span><strong>{profile.public_repos}</strong> repos</span>
          </div>
        </div>
        <div className="gh-profile-actions">
          <a href={profile.html_url} target="_blank" rel="noopener noreferrer" className="gh-btn-github">
            View on GitHub
          </a>
          <div className="gh-member-since">Member since {memberSinceYear}</div>
        </div>
      </div>

      {/* Section 3: Contribution Stats (Top part) */}
      {contributionStats ? (
        <div className="gh-stats-grid">
          <div className="gh-stat-card">
            <div className="gh-stat-icon">🔥</div>
            <div className="gh-stat-value">{contributionStats.totalContributions}</div>
            <div className="gh-stat-label">Total Contributions</div>
          </div>
          <div className="gh-stat-card">
            <div className="gh-stat-icon">💻</div>
            <div className="gh-stat-value">{contributionStats.totalCommits}</div>
            <div className="gh-stat-label">Commits</div>
          </div>
          <div className="gh-stat-card">
            <div className="gh-stat-icon">🔄</div>
            <div className="gh-stat-value">{contributionStats.totalPRs}</div>
            <div className="gh-stat-label">Pull Requests</div>
          </div>
          <div className="gh-stat-card">
            <div className="gh-stat-icon">⚠️</div>
            <div className="gh-stat-value">{contributionStats.totalIssues}</div>
            <div className="gh-stat-label">Issues</div>
          </div>
        </div>
      ) : (
        <div className="gh-unavailable">
          <p>Connect GitHub PAT for contribution stats</p>
        </div>
      )}

      {/* Section 2: Pinned Repos */}
      {pinnedRepos && pinnedRepos.length > 0 ? (
        <div className="gh-pinned-grid">
          {pinnedRepos.slice(0, 6).map((repo, i) => (
            <div key={i} className="gh-pinned-card">
              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="gh-pinned-name">
                📚 {repo.name}
              </a>
              <div className="gh-pinned-desc">{repo.description}</div>
              <div className="gh-pinned-meta">
                {repo.primaryLanguage && (
                  <span>
                    <span className="gh-lang-dot" style={{ backgroundColor: repo.primaryLanguage.color }}></span>
                    {repo.primaryLanguage.name}
                  </span>
                )}
                <span>⭐ {repo.stargazerCount}</span>
                <span>🔀 {repo.forkCount}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gh-unavailable">
          <p>Connect GitHub PAT to see pinned repos</p>
        </div>
      )}

      {/* Section 3: Contribution Calendar (Bottom part) */}
      {contributionStats && contributionStats.weeks && (
        <div className="gh-calendar-wrapper">
          <div className="gh-calendar-title">
            <span>Contributions (Last year)</span>
            <div className="gh-calendar-total">
              <strong>{contributionStats.totalContributions}</strong> contributions
            </div>
          </div>
          <div className="gh-calendar-months">
             {/* Just a simple representation of months for now */}
             <div style={{ flex: 1 }}>Jan</div>
             <div style={{ flex: 1 }}>Feb</div>
             <div style={{ flex: 1 }}>Mar</div>
             <div style={{ flex: 1 }}>Apr</div>
             <div style={{ flex: 1 }}>May</div>
             <div style={{ flex: 1 }}>Jun</div>
             <div style={{ flex: 1 }}>Jul</div>
             <div style={{ flex: 1 }}>Aug</div>
             <div style={{ flex: 1 }}>Sep</div>
             <div style={{ flex: 1 }}>Oct</div>
             <div style={{ flex: 1 }}>Nov</div>
             <div style={{ flex: 1 }}>Dec</div>
          </div>
          <div className="gh-calendar-grid">
            {contributionStats.weeks.map((week, i) => (
              week.contributionDays.map((day, j) => (
                <div 
                  key={`${i}-${j}`} 
                  className="gh-calendar-day" 
                  data-level={getLevel(day.contributionLevel)}
                  title={`${day.contributionCount} contributions on ${day.date}`}
                >
                </div>
              ))
            ))}
          </div>
          <div className="gh-calendar-legend">
            Less
            <div className="gh-legend-box" style={{ background: '#161b22' }}></div>
            <div className="gh-legend-box" style={{ background: '#0e4429' }}></div>
            <div className="gh-legend-box" style={{ background: '#006d32' }}></div>
            <div className="gh-legend-box" style={{ background: '#26a641' }}></div>
            <div className="gh-legend-box" style={{ background: '#39d353' }}></div>
            More
          </div>
        </div>
      )}

      {/* Section 4: Top Languages */}
      {languageStats && languageStats.length > 0 && (
        <div className="gh-languages-card">
          <div className="gh-languages-title">Top Languages</div>
          <div className="gh-lang-bar">
            {languageStats.map((lang, i) => (
              <div 
                key={i} 
                className="gh-lang-segment" 
                style={{ 
                  backgroundColor: lang.color || '#ccc', 
                  width: `${lang.percentage}%` 
                }}
                title={`${lang.name}: ${lang.percentage}%`}
              ></div>
            ))}
          </div>
          <div className="gh-lang-legend">
            {languageStats.map((lang, i) => (
              <div key={i} className="gh-lang-item">
                <span className="gh-lang-dot" style={{ backgroundColor: lang.color || '#ccc' }}></span>
                <span>{lang.name}</span>
                <span className="gh-lang-pct">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Recent Repositories */}
      {repos && repos.length > 0 && (
        <div>
          <div className="gh-section-header" style={{ marginTop: '2rem' }}>
            <h3>Recent Repositories</h3>
          </div>
          <div className="gh-repos-grid">
            {repos.slice(0, 10).map((repo, i) => (
              <div key={i} className="gh-repo-card">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="gh-repo-name">
                  {repo.name}
                </a>
                <div className="gh-repo-desc">{repo.description}</div>
                <div className="gh-repo-meta">
                  {repo.language && (
                    <span>
                      <span className="gh-lang-dot" style={{ backgroundColor: '#8b949e' }}></span>
                      {repo.language}
                    </span>
                  )}
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🔀 {repo.forks_count}</span>
                  <span>🕒 {timeAgo(repo.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="gh-view-all">
            <a href={`${profile.html_url}?tab=repositories`} target="_blank" rel="noopener noreferrer">
              View all on GitHub →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
