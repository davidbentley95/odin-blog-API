import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, formatDate } from './api.js';

export default function PostEditor() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const isNew = !postId;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [errors, setErrors] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api(`/posts/${postId}`)
      .then(({ post }) => {
        setTitle(post.title);
        setBody(post.body);
        setPublished(post.published);
        setComments(post.comments);
      })
      .catch((err) => setErrors([err.message]))
      .finally(() => setLoading(false));
  }, [postId, isNew]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    setSaved(false);
    try {
      const data = { title, body, published };
      if (isNew) {
        const { post } = await api('/posts', { method: 'POST', body: data });
        navigate(`/posts/${post.id}`, { replace: true });
      } else {
        await api(`/posts/${postId}`, { method: 'PUT', body: data });
        setSaved(true);
      }
    } catch (err) {
      setErrors(err.details?.map((d) => d.msg) ?? [err.message]);
    }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <>
      <Link to="/" className="muted">← All posts</Link>
      <form onSubmit={handleSubmit} className="card form">
        <h1>{isNew ? 'New post' : 'Edit post'}</h1>
        {errors.map((msg) => <p key={msg} className="error">{msg}</p>)}
        {saved && <p className="success">Saved.</p>}
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
        </label>
        <label>
          Body <span className="muted">(blank lines separate paragraphs)</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} required />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published
        </label>
        <button>{isNew ? 'Create post' : 'Save changes'}</button>
      </form>

      {!isNew && <CommentManager postId={postId} comments={comments} setComments={setComments} />}
    </>
  );
}

function CommentManager({ postId, comments, setComments }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);

  async function saveEdit(id) {
    try {
      const { comment } = await api(`/posts/${postId}/comments/${id}`, { method: 'PUT', body: { body: draft } });
      setComments((cs) => cs.map((c) => (c.id === id ? comment : c)));
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err.details?.[0]?.msg ?? err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api(`/posts/${postId}/comments/${id}`, { method: 'DELETE' });
      setComments((cs) => cs.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="comments">
      <h2>Comments ({comments.length})</h2>
      {error && <p className="error">{error}</p>}
      {comments.length === 0 && <p className="muted">No comments on this post.</p>}
      {comments.map((c) => (
        <div key={c.id} className="comment">
          <p><strong>{c.authorName}</strong> <span className="muted">· {formatDate(c.createdAt)}</span></p>
          {editingId === c.id ? (
            <>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
              <div className="actions">
                <button onClick={() => saveEdit(c.id)}>Save</button>
                <button className="link" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p>{c.body}</p>
              <div className="actions">
                <button className="link" onClick={() => { setEditingId(c.id); setDraft(c.body); }}>Edit</button>
                <button className="link danger-text" onClick={() => remove(c.id)}>Delete</button>
              </div>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
