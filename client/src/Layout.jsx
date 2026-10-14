import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">The Odin Blog</Link>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
