import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, CLIENT_URL } from './api.js';

export default function Dashboard() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/posts').then((data) => setPosts(data.posts)).catch((err) => setError(err.message));
  }, []);

  async function togglePublished(post) {
    try {
      const { post: updated } = await api(`/posts/${post.id}/publish`, {
        method: 'PATCH',
        body: { published: !post.published },
      });
      setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, ...updated } : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePost(post) {
    if (!window.confirm(`Delete "${post.title}" and all its comments?`)) return;
    try {
      await api(`/posts/${post.id}`, { method: 'DELETE' });
      setPosts((ps) => ps.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (!posts && !error) return <p className="muted">Loading posts…</p>;

  return (
    <>
      <div className="row">
        <h1>All posts</h1>
        <Link to="/posts/new" className="button">New post</Link>
      </div>
      {error && <p className="error">{error}</p>}
      {posts?.length === 0 && <p className="muted">No posts yet.</p>}
      <table className="posts-table">
        <thead>
          <tr><th>Title</th><th>Status</th><th>Comments</th><th>Updated</th><th /></tr>
        </thead>
        <tbody>
          {posts?.map((post) => (
            <tr key={post.id}>
              <td><Link to={`/posts/${post.id}`}>{post.title}</Link></td>
              <td>
                <span className={`badge ${post.published ? 'published' : 'draft'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td>{post._count.comments}</td>
              <td className="muted">{formatDate(post.updatedAt)}</td>
              <td className="actions">
                <button onClick={() => togglePublished(post)}>{post.published ? 'Unpublish' : 'Publish'}</button>
                {post.published && <a href={`${CLIENT_URL}/posts/${post.id}`} target="_blank" rel="noreferrer">View</a>}
                <button className="danger" onClick={() => deletePost(post)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
