import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

const STEPS = [
  { num: '01', title: 'Pick a Challenge', text: 'Walk the world map and choose a coding challenge from Python basics to recursion.' },
  { num: '02', title: 'Solve & Submit', text: 'Write your solution in the built-in editor, run it against sample cases, then submit for grading.' },
  { num: '03', title: 'Earn XP & Level Up', text: 'Pass all test cases to earn XP, grow your home, build streaks, and unlock badges.' },
];

const FEATURES = [
  { icon: '🏠', title: 'Build Your Home', text: 'Watch your house grow brick by brick as you solve more challenges.' },
  { icon: '🐍', title: 'SnakeBuddy Mode', text: 'Prefer a different vibe? Switch to a snake companion that hunts for food as you type.' },
  { icon: '🔥', title: 'Streaks & Badges', text: 'Keep your daily streak alive and unlock badges for consistency and skill.' },
  { icon: '🤖', title: 'AI Tutor', text: 'Stuck? Ask the built-in AI tutor for hints, not full answers, right inside the challenge.' },
  { icon: '🏆', title: 'Leaderboard', text: 'Compete with classmates on weekly XP and climb the ranks.' },
  { icon: '🎨', title: '3 Themes', text: 'Code in dark, light, or warm wood/parchment mode, whichever helps you focus.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="land-shell">
      <div className="land-rain">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="land-rain-col"
            style={{
              left: `${(i * 7) + 1}%`,
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${6 + (i % 4)}s`,
            }}
          >
            {['01', '{}', '[]', '//', '&&', '=>', '::', '!=', '++', '**', '<<', '>>', 'def', 'if'][i]}
          </span>
        ))}
      </div>

    {/* Top bar */}
    <div className="land-topbar">
    <Logo size="md" linkTo={null} />
    <div className="land-topbar-actions">
        <ThemeToggle />
        <button 
        className="land-login-btn px-6 py-2.5 rounded-xl border border-white/30 hover:bg-white/10 transition-all font-medium"
        onClick={() => navigate('/login')}
        >
        Log In
        </button>
    </div>
    </div>

      {/* Hero */}
      <section className="land-hero">
        <div className="land-hero-text">
          <h1 className="land-hero-title">
            <span className="land-typed">PYQUEST</span><span className="land-cursor">_</span>
          </h1>
          <p className="land-hero-sub">Learn Python the way you level up a game.</p>
          <p className="land-hero-desc">
            Solve real coding challenges, watch your home grow with every win, and build a streak
            you don't want to break. Built for first-semester students who'd rather quest than cram.
          </p>
          <div className="land-hero-ctas">
            <button className="land-cta-primary" onClick={() => navigate('/register')}>
              <span className="land-cta-bracket">[</span> Start Quest <span className="land-cta-bracket">]</span>
            </button>
            <button className="land-cta-secondary" onClick={() => navigate('/login')}>
              Continue Journey
            </button>
          </div>
        </div>

        <div className="land-hero-art">
          <svg width="220" height="320" viewBox="0 0 110 180" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="55" cy="172" rx="22" ry="5" fill="#000" opacity="0.25" />
            <path d="M34 68 Q24 88 26 118 Q34 124 40 114 Q43 92 45 86 Q50 78 55 86 Q60 78 65 86 Q67 92 70 114 Q76 124 84 118 Q86 88 76 68 Z" fill="#1e3a5f" />
            <rect x="38" y="114" width="12" height="26" rx="5" fill="#1e3a5f" stroke="#1d4ed8" strokeWidth="1" />
            <rect x="60" y="114" width="12" height="26" rx="5" fill="#1e3a5f" stroke="#1d4ed8" strokeWidth="1" />
            <ellipse cx="44" cy="140" rx="10" ry="5" fill="#0f172a" />
            <ellipse cx="66" cy="140" rx="10" ry="5" fill="#0f172a" />
            <rect x="32" y="68" width="46" height="50" rx="10" fill="#1d4ed8" />
            <rect x="44" y="96" width="22" height="14" rx="4" fill="#1e40af" />
            <rect x="32" y="104" width="46" height="6" rx="2" fill="#0f172a" />
            <rect x="50" y="103" width="10" height="8" rx="2" fill="#3b82f6" />
            <line x1="32" y1="78" x2="16" y2="98" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <line x1="78" y1="78" x2="94" y2="98" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <circle cx="14" cy="100" r="7" fill="#fde68a" />
            <circle cx="96" cy="100" r="7" fill="#fde68a" />
            <rect x="48" y="52" width="14" height="18" rx="4" fill="#fde68a" />
            <ellipse cx="55" cy="38" rx="24" ry="22" fill="#fde68a" />
            <path d="M32 32 Q30 16 40 12 Q44 20 46 14 Q50 6 55 8 Q60 6 64 14 Q66 20 70 12 Q80 16 78 32" fill="#1e293b" />
            <circle cx="44" cy="38" r="6" fill="white" />
            <circle cx="66" cy="38" r="6" fill="white" />
            <circle cx="45" cy="38" r="3" fill="#1e293b" />
            <circle cx="67" cy="38" r="3" fill="#1e293b" />
            <path d="M44 48 Q55 56 66 48" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
            <rect x="32" y="28" width="46" height="7" rx="3.5" fill="#1e3a5f" />
            <rect x="48" y="26" width="14" height="11" rx="3" fill="#1d4ed8" />
            <circle cx="55" cy="31" r="3" fill="#60a5fa" />
            <path d="M78 80 Q88 74 90 80 Q92 86 84 88 Q80 89 82 94" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
            <circle cx="82" cy="96" r="3" fill="#22c55e" />
          </svg>
          <div className="land-hero-glow" />
        </div>
      </section>

      {/* How it works */}
      <section className="land-section">
        <p className="land-section-tag">How It Works</p>
        <h2 className="land-section-title">Three steps to your first badge</h2>
        <div className="land-steps">
          {STEPS.map(s => (
            <div key={s.num} className="land-step-card">
              <span className="land-step-num">{s.num}</span>
              <h3 className="land-step-title">{s.title}</h3>
              <p className="land-step-text">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="land-section land-section--alt">
        <p className="land-section-tag">Features</p>
        <h2 className="land-section-title">Built to keep you coming back</h2>
        <div className="land-features">
          {FEATURES.map(f => (
            <div key={f.title} className="land-feature-card">
              <div className="land-feature-icon">{f.icon}</div>
              <h3 className="land-feature-title">{f.title}</h3>
              <p className="land-feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="land-footer-cta">
        <h2 className="land-footer-title">Ready to start your quest?</h2>
        <p className="land-footer-sub">No payment, no pressure: just you, Python, and a home to build.</p>
        <button className="land-cta-primary" onClick={() => navigate('/register')}>
          <span className="land-cta-bracket">[</span> Create Character <span className="land-cta-bracket">]</span>
        </button>
        <p className="land-footer-meta">PyQuest — a thesis project built to make learning to code feel like playing one.</p>
      </section>
    </div>
  );
}