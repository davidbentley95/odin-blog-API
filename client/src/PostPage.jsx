import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, formatDate } from './api.js';

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/posts/${postId}`).then((data) => setPost(data.post)).catch(setError);
  }, [postId]);

  if (error) return <p className="error">{error.message}. <Link to="/">Back to all posts</Link></p>;
  if (!post) return <p className="muted">Loading…</p>;

  const addComment = (comment) => setPost((p) => ({ ...p, comments: [...p.comments, comment] }));

  return (
    <article>
      <Link to="/" className="muted">← All posts</Link>
      <h1>{post.title}</h1>
      <p className="muted">{formatDate(post.publishedAt)} · by {post.author.username}</p>
      {post.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}

      <section className="comments">
        <h2>Comments ({post.comments.length})</h2>
        {post.comments.map((c) => (
          <div key={c.id} className="comment">
            <p><strong>{c.authorName}</strong> <span className="muted">· {formatDate(c.createdAt)}</span></p>
            <p>{c.body}</p>
          </div>
        ))}
        <CommentForm postId={post.id} onCreated={addComment} />
      </section>
    </article>
  );
}

function CommentForm({ postId, onCreated }) {
  const [authorName, setAuthorName] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState([]);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setErrors([]);
    try {
      const { comment } = await api(`/posts/${postId}/comments`, { method: 'POST', body: { authorName, body } });
      onCreated(comment);
      setBody('');
    } catch (err) {
      setErrors(err.details?.map((d) => d.msg) ?? [err.message]);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card form">
      <h3>Leave a comment</h3>
      {errors.map((msg) => <p key={msg} className="error">{msg}</p>)}
      <label>
        Name
        <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={50} required />
      </label>
      <label>
        Comment
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={2000} required />
      </label>
      <button disabled={sending}>{sending ? 'Posting…' : 'Post comment'}</button>
    </form>
  );
}
