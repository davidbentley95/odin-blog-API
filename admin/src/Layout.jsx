import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from './api.js';

export default function Layout() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate('/login');
  }

  return (
    <>
      <header className="site-header row">
        <Link to="/" className="brand">Blog Dashboard</Link>
        <nav className="row">
          <Link to="/posts/new">New post</Link>
          <button className="link" onClick={logout}>Log out</button>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
