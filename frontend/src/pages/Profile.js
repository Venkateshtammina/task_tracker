import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useActivity } from '../context/ActivityContext';
import '../styles/profile.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { summary, fetchActivitySummary } = useActivity();

  useEffect(() => {
    fetchActivitySummary();
    // eslint-disable-next-line
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {getInitials(user?.name || 'User')}
          </div>
          <h1>{user?.name}</h1>
          <p className="profile-email">{user?.email}</p>

          <div className="profile-details">
            <div className="detail-section">
              <h2>Account Information</h2>
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{user?.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Member Since:</span>
                <span className="detail-value">
                  {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h2>Activity Summary</h2>
              <div className="activity-summary" style={{ marginTop: 32, marginBottom: 32 }}>
                <h3>Activity Summary</h3>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem' }}>
                  <li>Projects: {summary?.projectsCount ?? 0}</li>
                  <li>Tasks: {summary?.tasksCount ?? 0}</li>
                  <li>Completed Tasks: {summary?.completedTasksCount ?? 0}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 