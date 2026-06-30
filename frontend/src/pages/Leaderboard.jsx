import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useStore();

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(res => setUsers(res.data))
      .catch(() => navigate('/login'));
  }, []);

  const currentUserIndex = users.findIndex(u => u.display_name === user?.display_name);
  const currentUser = users[currentUserIndex];
  const top3 = users.slice(0, 3);

  const rankLabel = (i) => {
    if (i === 0) return <span className="lb-rank-gold">1</span>;
    if (i === 1) return <span className="lb-rank-silver">2</span>;
    if (i === 2) return <span className="lb-rank-bronze">3</span>;
    return <span className="lb-rank-num">#{i + 1}</span>;
  };

  return (
    <div className="lb-shell">
      <div className="pq-logo-fixed">
        <Logo size="sm" />
      </div>
      <div style={{position:'fixed', top:'1rem', right:'1rem', zIndex:10, width:'120px'}}>
        <ThemeToggle />
      </div>
      <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to map</button>
      <div className="lb-title">Leaderboard</div>
      <div className="lb-subtitle">Ranked by weekly XP: Resets every Monday</div>

      <div className="lb-podium">
        {[1, 0, 2].map(i => top3[i] && (
          <div key={top3[i].id} className={`lb-podium-slot lb-podium-${i}`}>
            <div className="lb-podium-avatar">{top3[i].display_name.charAt(0).toUpperCase()}</div>
            <div className="lb-podium-name">{top3[i].display_name}</div>
            <div className="lb-podium-xp">{top3[i].weekly_xp} XP</div>
            <div className={`lb-podium-base lb-base-${i}`}>
              {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
            </div>
          </div>
        ))}
      </div>

      <div className="lb-table">
        <div className="lb-table-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Level</span>
          <span>Weekly XP</span>
          <span>Total XP</span>
          <span>Solved</span>
        </div>
        {currentUser && currentUserIndex > 2 && (
          <>
            <div className="lb-row lb-row-me lb-row-pinned">
              <span>{rankLabel(currentUserIndex)}</span>
              <span className="lb-player-name">
                <span className="lb-player-avatar-sm">{currentUser.display_name.charAt(0).toUpperCase()}</span>
                {currentUser.display_name}
                <span className="lb-you-tag">You</span>
              </span>
              <span className="lb-level">Lv {currentUser.current_level}</span>
              <span className="lb-weekly">{currentUser.weekly_xp}</span>
              <span className="lb-total">{currentUser.total_xp}</span>
              <span className="lb-solved">{currentUser.problems_solved}</span>
            </div>
            <div className="lb-pin-divider" />
          </>
        )}
        {users.map((u, i) => u.display_name === user?.display_name && currentUserIndex > 2 ? null : (
          <div key={u.id} className={`lb-row ${i < 3 ? 'lb-row-top' : ''} ${u.display_name === user?.display_name ? 'lb-row-me' : ''}`}>
            <span>{rankLabel(i)}</span>
            <span className="lb-player-name">
              <span className="lb-player-avatar-sm">{u.display_name.charAt(0).toUpperCase()}</span>
              {u.display_name}
              {u.display_name === user?.display_name && <span className="lb-you-tag">You</span>}
            </span>
            <span className="lb-level">Lv {u.current_level}</span>
            <span className="lb-weekly">{u.weekly_xp}</span>
            <span className="lb-total">{u.total_xp}</span>
            <span className="lb-solved">{u.problems_solved}</span>
          </div>
        ))}
      </div>
    </div>
  );
}