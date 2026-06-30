import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';
import AuthGuide from '../components/AuthGuide';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser, setToken } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

return (
    <div className="auth-page">
      <div className="auth-rain">
        {Array.from({length: 12}).map((_, i) => (
          <span key={i} className="auth-rain-col" style={{left: `${(i * 8) + 2}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${6 + (i % 4)}s`}}>
            {['01','{}','[]','//','&&','=>','::', '!=','++','**','<<','>>'][i]}
          </span>
        ))}
      </div>

      <div style={{position:'fixed', top:'1rem', right:'1rem', zIndex:10, width:'120px'}}>
        <ThemeToggle />
      </div>
      <div className="auth-center auth-center--with-guide">
        <div className="auth-guide-left">
          <div className="auth-platform-name auth-platform-name--left">
            <span className="auth-typed">PYQUEST</span><span className="auth-cursor">_</span>
          </div>
          <AuthGuide />
        </div>

        <div className="auth-card">
          <div className="auth-card-top-bar" />
          <div className="auth-corner auth-corner--tl" />
          <div className="auth-corner auth-corner--tr" />
          <div className="auth-corner auth-corner--bl" />
          <div className="auth-corner auth-corner--br" />

          <h2 className="auth-card-title">CONTINUE JOURNEY</h2>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">&gt; EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">&gt; PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-btn">
              <span className="auth-btn-bracket">[</span>
              ENTER
              <span className="auth-btn-bracket">]</span>
            </button>
          </form>

          <div className="auth-divider" />
          <p className="auth-switch">No account? <Link to="/register">Create Character</Link></p>
        </div>
      </div>
    </div>
  );
}