import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [profile, setProfile] = useState(null);
  const { logout, user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, profileRes] = await Promise.all([
          api.get('/challenges'),
          api.get('/users/profile'),
        ]);
        setGroups(groupsRes.data);
        setProfile(profileRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {profile && (
        <div className="profile-bar">
          <span>👋 {profile.display_name}</span>
          <span>⭐ XP: {profile.total_xp}</span>
          <span>📊 Level: {profile.current_level}</span>
          <span>🔥 Streak: {profile.current_streak}</span>
          <span>✅ Solved: {profile.problems_solved}</span>
          <button onClick={() => navigate('/profile')}>Profile</button>
          <button onClick={() => navigate('/leaderboard')}>🏆 Leaderboard</button>
          {user?.role === 'admin' && <button onClick={() => navigate('/admin')}>⚙️ Admin</button>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      <h2>Challenges</h2>
      {groups.map(group => (
        <div key={group.id} className={`group-card ${group.is_unlocked ? 'unlocked' : 'locked'}`}>
          <h3>{group.name} {group.is_unlocked ? '🔓' : '🔒'}</h3>
          <p>{group.description}</p>
          {group.is_unlocked ? (
            <div className="challenge-list">
              {group.challenges.map(c => (
                <Link key={c.id} to={`/challenge/${c.id}`} className={`challenge-item ${c.is_solved ? 'solved' : ''}`}>
                  <span>{c.is_solved ? '✅' : '⬜'} {c.title}</span>
                  <span className={`difficulty ${c.difficulty}`}>{c.difficulty}</span>
                  <span>+{c.xp_reward} XP</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="locked-msg">Complete the previous group to unlock.</p>
          )}
        </div>
      ))}
    </div>
  );
}