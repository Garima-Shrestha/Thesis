import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/profile')
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'));
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h2>{profile.display_name}'s Profile</h2>
      <div className="stats-grid">
        <div className="stat-card"><h3>Total XP</h3><p>{profile.total_xp}</p></div>
        <div className="stat-card"><h3>Level</h3><p>{profile.current_level}</p></div>
        <div className="stat-card"><h3>Problems Solved</h3><p>{profile.problems_solved}</p></div>
        <div className="stat-card"><h3>Current Streak</h3><p>{profile.current_streak} days</p></div>
        <div className="stat-card"><h3>Longest Streak</h3><p>{profile.longest_streak} days</p></div>
        <div className="stat-card"><h3>Weekly XP</h3><p>{profile.weekly_xp}</p></div>
      </div>
      <h3>Badges</h3>
      {profile.badges.length === 0 ? (
        <p>No badges yet. Start solving challenges!</p>
      ) : (
        <div className="badges-grid">
          {profile.badges.map(b => (
            <div key={b.id} className="badge-card">
              <h4>🏆 {b.name}</h4>
              <p>{b.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}