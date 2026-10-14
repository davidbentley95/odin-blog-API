import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

// There is no public sign-up route: the single author account comes from
// AUTHOR_USERNAME / AUTHOR_PASSWORD. Safe to run on every deploy — it upserts,
// so changing AUTHOR_PASSWORD and redeploying rotates the password.
const { AUTHOR_USERNAME, AUTHOR_PASSWORD } = process.env;

if (!AUTHOR_USERNAME || !AUTHOR_PASSWORD) {
  console.log('seed: AUTHOR_USERNAME/AUTHOR_PASSWORD not set, skipping author account');
  process.exit(0);
}

const password = await bcrypt.hash(AUTHOR_PASSWORD, 10);

const author = await prisma.user.upsert({
  where: { username: AUTHOR_USERNAME },
  update: { password },
  create: { username: AUTHOR_USERNAME, password },
});

if (process.env.SEED_SAMPLE_POST === 'true' && (await prisma.post.count()) === 0) {
  await prisma.post.create({
    data: {
      title: 'Hello, world',
      body: 'This is the first post on the blog.\n\nEdit or delete it from the author dashboard.',
      published: true,
      publishedAt: new Date(),
      authorId: author.id,
      comments: { create: { authorName: 'Odin', body: 'Nice first post!' } },
    },
  });
}

console.log(`seed: author "${author.username}" ready`);
await prisma.$disconnect();
