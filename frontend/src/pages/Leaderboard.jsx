import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(res => setUsers(res.data))
      .catch(() => navigate('/login'));
  }, []);

  return (
    <div className="leaderboard-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h2>🏆 Leaderboard</h2>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span>Name</span>
          <span>Level</span>
          <span>Weekly XP</span>
          <span>Total XP</span>
          <span>Solved</span>
        </div>
        {users.map((user, index) => (
          <div key={user.id} className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}>
            <span className="rank">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
            </span>
            <span>{user.display_name}</span>
            <span>Level {user.current_level}</span>
            <span>{user.weekly_xp} XP</span>
            <span>{user.total_xp} XP</span>
            <span>{user.problems_solved} ✅</span>
          </div>
        ))}
      </div>
    </div>
  );
}