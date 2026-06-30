import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Challenge from './pages/Challenge';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import { useEffect } from 'react';

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (token) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />;
  }
  return children;
}


function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}


function ThemeLoader() {
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const valid = ['dark', 'light', 'wood'].includes(saved) ? saved : 'dark';
    document.documentElement.setAttribute('data-theme', valid);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeLoader />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/challenge/:id" element={<PrivateRoute><Challenge /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}