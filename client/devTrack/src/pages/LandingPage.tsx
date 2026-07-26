import React from 'react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, setActiveView } = useAuth();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="badge-glow">🚀 B2C Developer SaaS</span>
          <span>LeetCode, GitHub & Competitive Coding Tracker</span>
        </div>

        <h1 className="hero-title">
          Master Coding Interviews & <br />
          <span className="gradient-text">Track Your Dev Journey</span>
        </h1>

        <p className="hero-subtitle">
          DevTrack brings together your LeetCode stats, Codeforces ratings, GitHub contributions, 
          and daily target goals into one unified developer profile.
        </p>

        <div className="hero-actions">
          {user ? (
            <button className="btn btn-primary btn-lg" onClick={() => setActiveView('profile')}>
              View Profile Dashboard ⚡
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => setActiveView('auth')}>
              Create Free Account →
            </button>
          )}
          <button className="btn btn-secondary btn-lg" onClick={() => setActiveView('console')}>
            Try API Console 🛠️
          </button>
        </div>

        {/* Hero Preview Card */}
        <div className="hero-preview-card">
          <div className="card-glass-header">
            <div className="window-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <span className="preview-tag">Live Profile Sync</span>
          </div>

          <div className="preview-grid">
            <div className="stat-card">
              <div className="stat-icon leetcode">🧩</div>
              <div className="stat-info">
                <h4>LeetCode Solved</h4>
                <div className="stat-value">482 <span className="stat-sub">/ 500 Goal</span></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon github">🐙</div>
              <div className="stat-info">
                <h4>GitHub Commits</h4>
                <div className="stat-value">1,240 <span className="stat-sub">This Year</span></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon codeforces">🏆</div>
              <div className="stat-info">
                <h4>Codeforces Rating</h4>
                <div className="stat-value">1642 <span className="stat-sub">Specialist</span></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon company">🎯</div>
              <div className="stat-info">
                <h4>Target Goal</h4>
                <div className="stat-value">FAANG <span className="stat-sub">3 Problems/day</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-tag">WHY DEVTRACK?</span>
          <h2>Everything You Need To Crush Technical Interviews</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Unified Dashboard</h3>
            <p>Aggregate stats from LeetCode, Codeforces, CodeChef, and AtCoder with automated profile sync.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Goal & Streak Tracking</h3>
            <p>Set custom daily target question goals and keep your consistency streak alive every single day.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Target Company Benchmarks</h3>
            <p>Tailor your practice curriculum specifically for FAANG, MAANG, Microsoft, Uber, or high-growth Startups.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Passport & OAuth 2.0 Auth</h3>
            <p>Sign in instantly using Google, GitHub, or secure JWT email authentication with standard encryption.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to elevate your developer profile?</h2>
          <p>Join software engineers tracking their prep journey toward top tech companies.</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setActiveView(user ? 'profile' : 'auth')}
          >
            {user ? 'Go to Profile Dashboard' : 'Get Started Now'}
          </button>
        </div>
      </section>
    </div>
  );
};
