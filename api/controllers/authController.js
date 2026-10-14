import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { HttpError } from '../lib/httpError.js';
import { signToken } from '../middleware/auth.js';

export async function login(req, res) {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });

  // Same message for unknown user and wrong password, so the endpoint can't
  // be used to discover usernames.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'Incorrect username or password');
  }

  res.json({ token: signToken(user), user: { id: user.id, username: user.username } });
}

export function me(req, res) {
  res.json({ user: req.user });
}
