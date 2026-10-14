import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter.js';
import postsRouter from './routes/postsRouter.js';
import { HttpError } from './lib/httpError.js';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const app = express();

// CLIENT_ORIGINS is a comma-separated list (reader site, author site). Left
// unset in development so any localhost port can call the API.
const origins = process.env.CLIENT_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: origins?.length ? origins : true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

app.use((req, res, next) => next(new HttpError(404, 'Not found')));

app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? 'Something went wrong' : err.message,
    ...(err.details && { details: err.details }),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Blog API listening on port ${PORT}`));
