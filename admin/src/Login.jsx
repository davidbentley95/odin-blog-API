import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from './api.js';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { token } = await api('/auth/login', { method: 'POST', body: { username, password } });
      setToken(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <main className="container narrow">
      <form onSubmit={handleSubmit} className="card form">
        <h1>Author log in</h1>
        {error && <p className="error">{error}</p>}
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        <button disabled={sending}>{sending ? 'Logging in…' : 'Log in'}</button>
      </form>
    </main>
  );
}
