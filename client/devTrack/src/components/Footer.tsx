import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand-section">
          <div className="brand" style={{ marginBottom: '0.75rem' }}>
            <div className="brand-icon" style={{ width: 28, height: 28 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span className="brand-name" style={{ fontSize: '1.1rem' }}>
              Dev<span className="brand-highlight">Track</span>
            </span>
          </div>
          <p className="footer-desc">
            The developer intelligence SaaS for coding interview preparation, platform stat aggregation, and FAANG target tracking.
          </p>
        </div>

        <div className="footer-links-grid">
          <div>
            <h4>Supported Platforms</h4>
            <ul>
              <li>LeetCode</li>
              <li>GitHub</li>
              <li>Codeforces</li>
              <li>CodeChef</li>
            </ul>
          </div>
          <div>
            <h4>Architecture</h4>
            <ul>
              <li>Passport.js Local & OAuth</li>
              <li>Express & Node.js</li>
              <li>Prisma PostgreSQL ORM</li>
              <li>React & Vite TS</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 DevTrack SaaS. Built for Software Engineers worldwide.</p>
      </div>
    </footer>
  );
};
