import jwt from 'jsonwebtoken';
import { HttpError } from '../lib/httpError.js';

// Tokens travel as "Authorization: Bearer <jwt>". The payload carries the
// user's id and username, so routes never need a database lookup to know who
// is calling.
function readToken(req) {
  const [scheme, token] = req.get('Authorization')?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const payload = readToken(req);
  if (!payload) return next(new HttpError(401, 'Authentication required'));
  req.user = { id: payload.sub, username: payload.username };
  next();
}

// Public routes that show more to a signed-in author (e.g. unpublished posts).
export function optionalAuth(req, res, next) {
  const payload = readToken(req);
  if (payload) req.user = { id: payload.sub, username: payload.username };
  next();
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}
