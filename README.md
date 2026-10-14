# Odin Blog API

My solution to [The Odin Project's Blog API project](https://www.theodinproject.com/lessons/node-path-nodejs-blog-api): a REST API with a separate reader site and a separate author dashboard.

| Folder    | What it is                                                     | Stack                                     |
| --------- | -------------------------------------------------------------- | ----------------------------------------- |
| `api/`    | REST API: posts, comments and JWT-protected author routes      | Express 5, Prisma 7, PostgreSQL, jsonwebtoken |
| `client/` | Reader site: browse published posts and leave comments         | React 19, Vite, React Router              |
| `admin/`  | Author dashboard: write, edit, publish/unpublish, moderate comments | React 19, Vite, React Router         |

## API

All routes live under `/api`. Protected routes need an `Authorization: Bearer <token>` header with the JWT from `/auth/login`.

| Method | Route                                   | Auth     | Description                                      |
| ------ | --------------------------------------- | -------- | ------------------------------------------------ |
| POST   | `/auth/login`                           | —        | `{ username, password }` → `{ token, user }`     |
| GET    | `/auth/me`                              | required | The user the token belongs to                    |
| GET    | `/posts`                                | optional | Published posts; with a token, drafts too        |
| GET    | `/posts/:postId`                        | optional | One post with its comments (drafts 404 publicly) |
| POST   | `/posts`                                | required | Create `{ title, body, published? }`             |
| PUT    | `/posts/:postId`                        | required | Replace title/body/published                     |
| PATCH  | `/posts/:postId/publish`                | required | `{ published: true \| false }`                   |
| DELETE | `/posts/:postId`                        | required | Delete a post and its comments                   |
| GET    | `/posts/:postId/comments`               | optional | Comments on a post                               |
| POST   | `/posts/:postId/comments`               | —        | `{ authorName, body }`                           |
| PUT    | `/posts/:postId/comments/:commentId`    | required | Edit a comment's body                            |
| DELETE | `/posts/:postId/comments/:commentId`    | required | Delete a comment                                 |

Design notes:

- **Only authors have accounts.** Readers comment with a display name, so there's no sign-up route; the author account is created by `npm run seed` from `AUTHOR_USERNAME` / `AUTHOR_PASSWORD`.
- **Drafts are hidden, not forbidden.** An unpublished post returns 404 to readers so the API doesn't leak that it exists.
- **`publishedAt` is set once**, the first time a post goes public, so unpublishing and republishing doesn't change its date.
- The client stores the JWT in `localStorage`, as the project suggests, and drops it on a 401.

## Running locally

Needs Node 22.18+ and PostgreSQL.

```bash
# API (http://localhost:3000)
cd api
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, AUTHOR_PASSWORD
npm install
npx prisma migrate dev
npx prisma generate
npm run seed
npm run dev

# Reader site (http://localhost:5173)
cd client && npm install && npm run dev

# Author dashboard (http://localhost:5174)
cd admin && npm install && npm run dev
```

## Deployment

Everything runs on [Render](https://render.com):

- **Database and frontends** come from the Blueprint in `render.yaml`: a Render Postgres database and two static sites.
- **API** is a standalone Render Web Service (root directory `api`). Its build command, start command and environment variables are listed in the comments at the top of `render.yaml`.

Render's free Postgres expires after 30 days. To keep the blog longer, point `DATABASE_URL` at a free Neon or Supabase database instead.
