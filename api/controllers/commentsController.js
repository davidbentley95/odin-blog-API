import prisma from '../lib/prisma.js';
import { HttpError, parseId } from '../lib/httpError.js';
import { findVisiblePost } from './postsController.js';

async function findComment(req) {
  const comment = await prisma.comment.findUnique({ where: { id: parseId(req.params.commentId) } });
  if (!comment || comment.postId !== parseId(req.params.postId)) throw new HttpError(404, 'Comment not found');
  return comment;
}

export async function list(req, res) {
  const post = await findVisiblePost(req, req.params.postId);
  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ comments });
}

export async function create(req, res) {
  const post = await findVisiblePost(req, req.params.postId);
  const comment = await prisma.comment.create({
    data: { authorName: req.body.authorName, body: req.body.body, postId: post.id },
  });
  res.status(201).json({ comment });
}

export async function update(req, res) {
  const existing = await findComment(req);
  const comment = await prisma.comment.update({
    where: { id: existing.id },
    data: { body: req.body.body },
  });
  res.json({ comment });
}

export async function destroy(req, res) {
  const existing = await findComment(req);
  await prisma.comment.delete({ where: { id: existing.id } });
  res.status(204).end();
}
