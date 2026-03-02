import React, { useState } from 'react';
import './Repo.css';
import { useLocation, useNavigate } from 'react-router-dom';
import "bootstrap-icons/font/bootstrap-icons.css";
import api from '../api';

export default function Account() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [bucketItems, setBucketItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const user = Boolean(token);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const fetchItems = async () => {
    try {
      const r = await api.get('/');
      setBucketItems(r.data);
    } catch {
      /* ignore */
    }
  };

  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Username and password are required.');
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? new URLSearchParams(form)
        : form;

      const r = await api.post(endpoint, payload, {
        headers: isLogin 
          ? { 'Content-Type': 'application/x-www-form-urlencoded' } 
          : undefined
      });

      if (isLogin) {
        const token = r.data.access_token;
        setToken(token);
        localStorage.setItem('token', token);
        fetchItems();
      } else {
        // after register, clear the form but stay on login screen
        setIsLogin(true);
      }
      setForm({ username: '', password: '' });
     } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        // Pydantic-style error list
        const msg = detail.map(d => d.msg).join(' | ');
        setError(msg);
      } else if (typeof detail === 'string') {
        // Custom string error (e.g., from HTTPException)
        setError(detail);
      } else {
        setError(isLogin ? 'Login failed.' : 'Registration failed.');
      }
    }
  };

  const handleEdit = async () => {
    const payload = {};
    if (form.username) payload.username = form.username;
    if (form.password) payload.password = form.password;
    try {
      await api.put('/user', payload);
      alert('Account updated.');
      setForm({ username: '', password: '' });
    } catch {
      setError('Update failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete('/user');
      handleLogout();
    } catch {
      setError('Account deletion failed.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setBucketItems([]);
    setForm({ username: '', password: '' });
  };

  const handleDemo = () => {
    setForm({ username: 'demo', password: 'TEST1!pw' });
    
  };

  // --- Render ---
  if (!user) {
    return (
      <div className="account">
        <header className="header">
          <h1>DreamStack</h1>
          <nav className='nav'>
          <button 
                className={`b1 ${location.pathname === '/' ? 'active-nav' : ''}`}
                onClick={() => navigate('/')}
              >
                <i className="bi bi-house-door"></i>
              </button>
              <button 
                className={`b2 ${location.pathname === '/add' ? 'active-nav' : ''}`}
                onClick={() => navigate('/add')}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
              <button 
                className={`b3 ${location.pathname === '/edit' ? 'active-nav' : ''}`}
                onClick={() => navigate('/edit')}
              >
                <i className="bi bi-pencil-square"></i>
              </button>
                <button 
                    className={`b4 ${location.pathname === '/account' ? 'active-nav' : ''}`}
                    onClick={() => navigate('/account')}
                >
                  <i className="bi bi-person"></i>
                </button>
          </nav>
        </header>
        <h5 className="tagline">Save it. Plan it. Live it.</h5>

        <div className="account-page">
          <div className="auth-container">
            <h2 className="auth-title">{isLogin ? 'Log In' : 'Register'}</h2>
            <form className="auth-form" onSubmit={handleLoginOrRegister}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  className="form-input"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
                {!isLogin && (
                  <p className="username-hint">
                    Must be unique and at least 3 characters long.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {!isLogin && (
                  <p className="password-hint">
                    Must be ≥8 chars, have upper & lower case, a number & special character.
                  </p>
                )}
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="btn btn-primary">
                {isLogin ? 'Log In' : 'Register'}
              </button>
            </form>

            <div className="toggle-link">
              {isLogin
                ? <span>Don't have an account? <button className="link-btn" onClick={() => { setIsLogin(false); setError(''); }}>Register</button></span>
                : <span>Already have an account? <button className="link-btn" onClick={() => { setIsLogin(true); setError(''); }}>Log In</button></span>
              }
            </div>
          </div>
            <button className="demo-btn" onClick={handleDemo}>Demo Account</button>
        </div>
        
      </div>
    );
  }

  return (
    <div className="account">
        <header className="header">
          <h1>DreamStack</h1>
          <nav className='nav'>
          <button 
                className={`b1 ${location.pathname === '/' ? 'active-nav' : ''}`}
                onClick={() => navigate('/')}
              >
                <i className="bi bi-house-door"></i>
              </button>
              <button 
                className={`b2 ${location.pathname === '/add' ? 'active-nav' : ''}`}
                onClick={() => navigate('/add')}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
              <button 
                className={`b3 ${location.pathname === '/edit' ? 'active-nav' : ''}`}
                onClick={() => navigate('/edit')}
              >
                <i className="bi bi-pencil-square"></i>
              </button>
                <button 
                    className={`b4 ${location.pathname === '/account' ? 'active-nav' : ''}`}
                    onClick={() => navigate('/account')}
                >
                  <i className="bi bi-person"></i>
                </button>
          </nav>
        </header>
        <h5 className="tagline">Save it. Plan it. Live it.</h5>
    <div className="account-page">
      <div className="account-container">
        <h2>Account Management</h2>

        <form className="edit-form" onSubmit={e => { e.preventDefault(); handleEdit(); }}>
          <div className="form-group">
            <label htmlFor="new-username">New Username</label>
            <input
              id="new-username"
              name="username"
              className="form-input"
              value={form.username}
              onChange={handleChange}
            />
            <p className="username-hint">
              (leave blank to keep current username; must be unique)
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handleChange}
            />
            <p className="password-hint">
              (leave blank to keep current password; must meet strength rules)
            </p>
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete Account</button>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
