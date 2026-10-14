import prisma from '../lib/prisma.js';
import { HttpError, parseId } from '../lib/httpError.js';

const author = { select: { id: true, username: true } };

// Drafts are invisible to readers: a 404 rather than a 403, so the API doesn't
// reveal that an unpublished post exists.
export async function findVisiblePost(req, postId) {
  const post = await prisma.post.findUnique({ where: { id: parseId(postId) } });
  if (!post || (!post.published && !req.user)) throw new HttpError(404, 'Post not found');
  return post;
}

async function findOwnPost(req) {
  const post = await prisma.post.findUnique({ where: { id: parseId(req.params.postId) } });
  if (!post) throw new HttpError(404, 'Post not found');
  if (post.authorId !== req.user.id) throw new HttpError(403, 'You can only change your own posts');
  return post;
}

// publishedAt records the first time a post went live and never moves after.
function publishedFields(post, published) {
  return { published, publishedAt: published ? (post?.publishedAt ?? new Date()) : (post?.publishedAt ?? null) };
}

export async function list(req, res) {
  const posts = await prisma.post.findMany({
    where: req.user ? {} : { published: true },
    orderBy: req.user ? { updatedAt: 'desc' } : { publishedAt: 'desc' },
    include: { author, _count: { select: { comments: true } } },
  });
  res.json({ posts });
}

export async function show(req, res) {
  const { id } = await findVisiblePost(req, req.params.postId);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author, comments: { orderBy: { createdAt: 'asc' } } },
  });
  res.json({ post });
}

export async function create(req, res) {
  const { title, body, published = false } = req.body;
  const post = await prisma.post.create({
    data: { title, body, authorId: req.user.id, ...publishedFields(null, published) },
    include: { author },
  });
  res.status(201).json({ post });
}

export async function update(req, res) {
  const existing = await findOwnPost(req);
  const { title, body, published = existing.published } = req.body;
  const post = await prisma.post.update({
    where: { id: existing.id },
    data: { title, body, ...publishedFields(existing, published) },
    include: { author },
  });
  res.json({ post });
}

export async function setPublished(req, res) {
  const existing = await findOwnPost(req);
  const post = await prisma.post.update({
    where: { id: existing.id },
    data: publishedFields(existing, req.body.published),
    include: { author },
  });
  res.json({ post });
}

export async function destroy(req, res) {
  const existing = await findOwnPost(req);
  await prisma.post.delete({ where: { id: existing.id } });
  res.status(204).end();
}
