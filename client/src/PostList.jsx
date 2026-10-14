import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate } from './api.js';

export default function PostList() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/posts').then((data) => setPosts(data.posts)).catch(setError);
  }, []);

  if (error) return <p className="error">Couldn't load posts: {error.message}</p>;
  if (!posts) return <p className="muted">Loading posts…</p>;
  if (posts.length === 0) return <p className="muted">No posts yet. Check back soon.</p>;

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id} className="card">
          <h2><Link to={`/posts/${post.id}`}>{post.title}</Link></h2>
          <p className="muted">
            {formatDate(post.publishedAt)} · by {post.author.username} · {post._count.comments}{' '}
            {post._count.comments === 1 ? 'comment' : 'comments'}
          </p>
          <p>{post.body.length > 200 ? `${post.body.slice(0, 200)}…` : post.body}</p>
        </li>
      ))}
    </ul>
  );
}
