import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RANK_TITLES = [
  { min: 0,    title: 'Newcomer',        color: '#94a3b8' },
  { min: 1,    title: 'Beginner Coder',  color: '#22c55e' },
  { min: 3,    title: 'Python Learner',  color: '#3b82f6' },
  { min: 6,    title: 'Problem Solver',  color: '#8b5cf6' },
  { min: 10,   title: 'Code Apprentice', color: '#f59e0b' },
  { min: 15,   title: 'Code Architect',  color: '#ef4444' },
];

function getRankTitle(solved) {
  let rank = RANK_TITLES[0];
  for (const r of RANK_TITLES) {
    if (solved >= r.min) rank = r;
  }
  return rank;
}

function CharacterCanvas({ level, solved }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 120, H = 140;
    ctx.clearRect(0, 0, W, H);

    // Color scheme based on level
    const schemes = [
      { body: '#6366f1', skin: '#fbbf24', hair: '#1e293b', outfit: '#312e81' },
      { body: '#22c55e', skin: '#fbbf24', hair: '#1e293b', outfit: '#14532d' },
      { body: '#3b82f6', skin: '#fde68a', hair: '#292524', outfit: '#1e3a5f' },
      { body: '#8b5cf6', skin: '#fde68a', hair: '#292524', outfit: '#4c1d95' },
      { body: '#f59e0b', skin: '#fed7aa', hair: '#1c1917', outfit: '#78350f' },
      { body: '#ef4444', skin: '#fed7aa', hair: '#1c1917', outfit: '#7f1d1d' },
    ];
    const scheme = schemes[Math.min(Math.floor(level / 2), schemes.length - 1)];

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(60, 132, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = scheme.outfit;
    ctx.fillRect(44, 95, 14, 30);
    ctx.fillRect(62, 95, 14, 30);

    // Feet
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.ellipse(51, 126, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(69, 126, 10, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Body
    ctx.fillStyle = scheme.body;
    ctx.beginPath();
    ctx.moveTo(38, 95); ctx.lineTo(82, 95); ctx.lineTo(80, 62); ctx.lineTo(40, 62);
    ctx.closePath(); ctx.fill();

    // Outfit detail line
    ctx.strokeStyle = scheme.outfit;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(60, 62); ctx.lineTo(60, 95); ctx.stroke();

    // Arms
    ctx.fillStyle = scheme.body;
    ctx.fillRect(28, 62, 12, 28);
    ctx.fillRect(80, 62, 12, 28);

    // Hands
    ctx.fillStyle = scheme.skin;
    ctx.beginPath(); ctx.arc(34, 91, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(86, 91, 7, 0, Math.PI * 2); ctx.fill();

    // Neck
    ctx.fillStyle = scheme.skin;
    ctx.fillRect(54, 48, 12, 16);

    // Head
    ctx.fillStyle = scheme.skin;
    ctx.beginPath();
    ctx.roundRect(42, 20, 36, 34, 10);
    ctx.fill();

    // Hair
    ctx.fillStyle = scheme.hair;
    ctx.beginPath();
    ctx.roundRect(42, 18, 36, 16, [10, 10, 0, 0]);
    ctx.fill();
    // Hair spikes for higher levels
    if (level >= 4) {
      ctx.fillStyle = scheme.hair;
      ctx.beginPath(); ctx.moveTo(52, 18); ctx.lineTo(48, 8); ctx.lineTo(56, 16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(60, 18); ctx.lineTo(60, 6); ctx.lineTo(65, 16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(68, 18); ctx.lineTo(72, 9); ctx.lineTo(72, 17); ctx.closePath(); ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(52, 34, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(68, 34, 3, 0, Math.PI * 2); ctx.fill();
    // Eye shine
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(53, 33, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(69, 33, 1, 0, Math.PI * 2); ctx.fill();

    // Smile
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(60, 42, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Level badge on chest
    if (level > 1) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(60, 78, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(level, 60, 81);
    }

    // Cape for high levels
    if (level >= 6) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(40, 64); ctx.lineTo(28, 64); ctx.lineTo(22, 100); ctx.lineTo(38, 96);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(80, 64); ctx.lineTo(92, 64); ctx.lineTo(98, 100); ctx.lineTo(82, 96);
      ctx.closePath(); ctx.fill();
    }

  }, [level, solved]);

  return <canvas ref={canvasRef} width={120} height={140} style={{display:'block', margin:'0 auto'}} />;
}

function RecentActivity({ userId }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/users/activity-recent')
      .then(res => setRecent(res.data))
      .catch(() => {});
  }, []);

  if (recent.length === 0) return (
    <div className="gprofile-empty">No challenges solved yet: Start solving to see your activity!</div>
  );

  return (
    <div className="recent-activity">
      {recent.map((item, i) => (
        <div key={i} className="recent-item">
          <div className="recent-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="recent-info">
            <div className="recent-title">{item.title}</div>
            <div className="recent-meta">{item.topic_tag} · +{item.xp_reward} XP</div>
          </div>
          <div className="recent-date">{new Date(item.solved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
      ))}
    </div>
  );
}

const BADGE_ICONS = {
  problems_solved: '★',
  streak: '◆',
  total_xp: '▲',
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/profile')
      .then(res => setProfile(res.data))
      .catch(() => navigate('/login'));
  }, []);

  if (!profile) return <div className="game-loading">Loading...</div>;

  const xpToNext = [0,100,250,500,1000,2000,3500,5000,7000,10000];
  const currentLevelXp = xpToNext[profile.current_level - 1] || 0;
  const nextLevelXp = xpToNext[profile.current_level] || 10000;
  const xpProgress = Math.min((profile.total_xp - currentLevelXp) / (nextLevelXp - currentLevelXp), 1);
  const rankInfo = getRankTitle(profile.problems_solved);

  return (
    <div className="gprofile-shell">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>Back to map</button>

      <div className="gprofile-layout">

        <div className="gprofile-left">
          <div className="gprofile-character-card">
            <div className="gprofile-char-bg" />
            <CharacterCanvas level={profile.current_level} solved={profile.problems_solved} />
            <div className="gprofile-char-name">{profile.display_name}</div>
            <div className="gprofile-char-rank" style={{ color: rankInfo.color }}>{rankInfo.title}</div>
            <div className="gprofile-char-level">Level {profile.current_level}</div>
            <div className="gprofile-xp-bar-wrap" style={{padding:'0 1rem 0.5rem'}}>
              <div className="gprofile-xp-bar">
                <div className="gprofile-xp-fill" style={{ width: `${xpProgress * 100}%` }} />
              </div>
              <span className="gprofile-xp-next">{nextLevelXp - profile.total_xp} XP to next level</span>
            </div>
          </div>

          <div className="gprofile-mini-stats">
            <div className="gprofile-mini-stat">
              <div className="gprofile-mini-val">{profile.total_xp}</div>
              <div className="gprofile-mini-key">Total XP</div>
            </div>
            <div className="gprofile-mini-stat">
              <div className="gprofile-mini-val">{profile.problems_solved}</div>
              <div className="gprofile-mini-key">Solved</div>
            </div>
            <div className="gprofile-mini-stat">
              <div className="gprofile-mini-val">{profile.current_streak}</div>
              <div className="gprofile-mini-key">Streak</div>
            </div>
            <div className="gprofile-mini-stat">
              <div className="gprofile-mini-val">{profile.longest_streak}</div>
              <div className="gprofile-mini-key">Best Streak</div>
            </div>
          </div>
        </div>

        <div className="gprofile-right">
          <div className="gprofile-section-title">Recent Activity</div>
          <RecentActivity />

          <div className="gprofile-section-title" style={{marginTop:'1.5rem'}}>Badges</div>
          {profile.badges.length === 0 ? (
            <div className="gprofile-empty">No badges yet: Solve challenges to earn them!</div>
          ) : (
            <div className="gprofile-badges">
              {profile.badges.map(b => (
                <div key={b.id} className="gprofile-badge">
                  <div className="gprofile-badge-icon">{BADGE_ICONS[b.trigger_type] || '★'}</div>
                  <div className="gprofile-badge-name">{b.name}</div>
                  <div className="gprofile-badge-desc">{b.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}