import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import AuthGuide from '../components/AuthGuide';

export default function Register() {
  const [form, setForm] = useState({ display_name: '', email: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api.post('/auth/register', {
        display_name: form.display_name,
        email: form.email,
        password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  // return (
  //   <div className="auth-container">
  //     <h2>Register</h2>
  //     <form onSubmit={handleRegister}>
  //       <input type="text" placeholder="Display Name" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} required />
  //       <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
  //       <input type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
  //       <input type="password" placeholder="Confirm Password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} required />
  //       {error && <p className="error">{error}</p>}
  //       <button type="submit">Register</button>
  //     </form>
  //     <p>Already have an account? <Link to="/login">Login</Link></p>
  //   </div>
  // );

return (
    <div className="auth-page">
      <div className="auth-rain">
        {Array.from({length: 12}).map((_, i) => (
          <span key={i} className="auth-rain-col" style={{left: `${(i * 8) + 2}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${6 + (i % 4)}s`}}>
            {['01','{}','[]','//','&&','=>','::', '!=','++','**','<<','>>'][i]}
          </span>
        ))}
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

          <h2 className="auth-card-title">CREATE CHARACTER</h2>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">&gt; USERNAME</label>
              <input type="text" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">&gt; EMAIL</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">&gt; PASSWORD</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">&gt; CONFIRM PASSWORD</label>
              <input type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} required />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-btn">
              <span className="auth-btn-bracket">[</span>
              BEGIN
              <span className="auth-btn-bracket">]</span>
            </button>
          </form>

          <div className="auth-divider" />
          <p className="auth-switch">Already a member? <Link to="/login">Continue Journey</Link></p>
        </div>
      </div>
    </div>
  );
}