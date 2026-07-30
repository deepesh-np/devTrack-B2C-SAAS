import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import type { Profile } from '../types';
import { GitHubIntegration } from '../components/GitHubIntegration';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, setActiveView } = useAuth();
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Profile>>({
    headline: '',
    bio: '',
    githubUsername: '',
    leetcodeUsername: '',
    codeforcesUsername: '',
    codechefUsername: '',
    atcoderUsername: '',
    college: '',
    degree: '',
    graduationYear: 2026,
    currentCompany: '',
    targetCompany: 'FAANG',
    dailyGoal: 3,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        headline: profile.headline || '',
        bio: profile.bio || '',
        githubUsername: profile.githubUsername || '',
        leetcodeUsername: profile.leetcodeUsername || '',
        codeforcesUsername: profile.codeforcesUsername || '',
        codechefUsername: profile.codechefUsername || '',
        atcoderUsername: profile.atcoderUsername || '',
        college: profile.college || '',
        degree: profile.degree || '',
        graduationYear: profile.graduationYear || 2026,
        currentCompany: profile.currentCompany || '',
        targetCompany: profile.targetCompany || 'FAANG',
        dailyGoal: profile.dailyGoal || 3,
      });
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      graduationYear: formData.graduationYear ? Number(formData.graduationYear) : undefined,
      dailyGoal: formData.dailyGoal ? Number(formData.dailyGoal) : 3,
    };

    const res = profile
      ? await apiService.updateProfile(payload)
      : await apiService.createProfile(payload);

    if (res.success) {
      await refreshProfile();
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } else {
      setMessage({
        type: 'error',
        text: res.message || 'Failed to save profile. Please review fields.',
      });
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="card text-center p-8">
          <h2>Authentication Required</h2>
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
            Please sign in to view and edit your developer profile.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveView('auth')}>
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Banner / Header */}
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-main-info">
          <div className="profile-avatar-wrapper">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-large-avatar" />
            ) : (
              <div className="profile-avatar-fallback">{user.name?.charAt(0) || 'U'}</div>
            )}
          </div>

          <div className="profile-details-text">
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            {profile?.headline && <p className="profile-headline">{profile.headline}</p>}
            
            <div className="profile-badges">
              <span className="badge auth-badge">{user.provider} Auth</span>
              {profile?.targetCompany && (
                <span className="badge target-badge">Target: {profile.targetCompany}</span>
              )}
              {profile?.dailyGoal && (
                <span className="badge goal-badge">🎯 Goal: {profile.dailyGoal} questions/day</span>
              )}
            </div>
          </div>

          <div className="profile-actions">
            <button
              className={`btn ${editing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel Editing' : profile ? 'Edit Profile' : 'Setup Profile'}
            </button>
          </div>
        </div>
      </div>

      {message && <div className={`alert-banner ${message.type}`}>{message.text}</div>}

      {/* Main Content Area */}
      {editing ? (
        /* EDIT PROFILE FORM */
        <div className="card edit-profile-card">
          <h3>{profile ? 'Edit Profile Details' : 'Initialize Your Profile'}</h3>
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Engineer @ Startup | Algorithmic Problem Solver"
                  value={formData.headline || ''}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  rows={3}
                  placeholder="Short bio about your journey, tech stack, or career goal..."
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="form-section-title">Coding Platform Usernames</div>

              <div className="form-group">
                <label>LeetCode Username</label>
                <input
                  type="text"
                  placeholder="e.g. alex_coder"
                  value={formData.leetcodeUsername || ''}
                  onChange={(e) => setFormData({ ...formData, leetcodeUsername: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>GitHub Username</label>
                <input
                  type="text"
                  placeholder="e.g. octocat"
                  value={formData.githubUsername || ''}
                  onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Codeforces Username</label>
                <input
                  type="text"
                  placeholder="e.g. tourist"
                  value={formData.codeforcesUsername || ''}
                  onChange={(e) => setFormData({ ...formData, codeforcesUsername: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>CodeChef Username</label>
                <input
                  type="text"
                  placeholder="e.g. chef_john"
                  value={formData.codechefUsername || ''}
                  onChange={(e) => setFormData({ ...formData, codechefUsername: e.target.value })}
                />
              </div>

              <div className="form-section-title">Education & Career</div>

              <div className="form-group">
                <label>College / University</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={formData.college || ''}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Degree / Major</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  placeholder="2026"
                  value={formData.graduationYear || ''}
                  onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Current Company / Role</label>
                <input
                  type="text"
                  placeholder="e.g. SDE Intern @ Acme Corp"
                  value={formData.currentCompany || ''}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Target Company Tier</label>
                <select
                  value={formData.targetCompany || 'FAANG'}
                  onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value as any })}
                >
                  <option value="FAANG">FAANG</option>
                  <option value="MAANG">MAANG</option>
                  <option value="MICROSOFT">Microsoft</option>
                  <option value="ADOBE">Adobe</option>
                  <option value="ATLASSIAN">Atlassian</option>
                  <option value="UBER">Uber</option>
                  <option value="STARTUP">High-Growth Startup</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Daily Problem Goal</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.dailyGoal || 3}
                  onChange={(e) => setFormData({ ...formData, dailyGoal: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving Profile...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* READ-ONLY PROFILE DISPLAY */
        <div className="profile-content-grid">
          <div className="card">
            <h3 className="card-heading">About & Overview</h3>
            <p className="bio-text">{profile?.bio || 'No bio provided yet. Click "Edit Profile" to set your headline and bio!'}</p>

            <div className="info-list">
              <div className="info-item">
                <span className="info-label">College</span>
                <span className="info-value">{profile?.college || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Degree</span>
                <span className="info-value">{profile?.degree || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Graduation</span>
                <span className="info-value">{profile?.graduationYear || 'Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Role</span>
                <span className="info-value">{profile?.currentCompany || 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-heading">Connected Platform Handles</h3>

            <div className="platforms-list">
              <div className="platform-row">
                <div className="platform-brand leetcode">🧩 LeetCode</div>
                <span className="platform-handle">
                  {profile?.leetcodeUsername ? `@${profile.leetcodeUsername}` : 'Not connected'}
                </span>
              </div>

              <div className="platform-row">
                <div className="platform-brand github">🐙 GitHub</div>
                <span className="platform-handle">
                  {profile?.githubUsername ? `@${profile.githubUsername}` : 'Not connected'}
                </span>
              </div>

              <div className="platform-row">
                <div className="platform-brand codeforces">🏆 Codeforces</div>
                <span className="platform-handle">
                  {profile?.codeforcesUsername ? `@${profile.codeforcesUsername}` : 'Not connected'}
                </span>
              </div>

              <div className="platform-row">
                <div className="platform-brand codechef">👨‍🍳 CodeChef</div>
                <span className="platform-handle">
                  {profile?.codechefUsername ? `@${profile.codechefUsername}` : 'Not connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {profile?.githubUsername && (
        <GitHubIntegration githubUsername={profile.githubUsername} />
      )}
    </div>
  );
};
