# Daymark Todo — Frontend + Backend

This workspace contains two independent applications in one parent folder:

```text
todo-fullstack/
├── frontend/   # React + Vite UI
└── backend/    # Express 5 + PostgreSQL API
```

The frontend is intentionally compatible with the current backend scaffold. The backend routes are currently `/auth/register`, `/auth/login`, and `/todos...` (they are not prefixed with `/api/v1` in this starter).

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL

## 1. Set up PostgreSQL

Create a database named `todo_api`, then run `backend/database/schema.sql` against it using pgAdmin or `psql`.

## 2. Configure the backend

Open a terminal in `backend/`:

```bash
npm install
```

Copy `.env.example` to `.env` and update the PostgreSQL credentials and JWT secret:

```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/todo_api
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_ISSUER=todo-api
JWT_AUDIENCE=todo-api
JWT_EXPIRES_IN=15m
CLIENT_ORIGIN=http://localhost:5173
```

Generate a secret rather than using the placeholder:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Start the backend:

```bash
npm run dev
```

Expected address: `http://localhost:3002`

Check it:

```text
http://localhost:3002/health
```

## 3. Configure the frontend

Open a second terminal in `frontend/`:

```bash
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:3002
```

Start Vite:

```bash
npm run dev
```

Open the address Vite prints (normally `http://localhost:5173`).

## 4. How the frontend connects to the backend

- `frontend/src/lib/api.js` owns the shared `fetch()` helper and API base URL.
- `frontend/src/context/AuthContext.jsx` calls `POST /auth/login` and `POST /auth/register`.
- After login, the response's `data.accessToken` and `data.user` are stored in browser `localStorage` for this learning project.
- Todo requests include `Authorization: Bearer <token>`.
- The dashboard calls `GET /todos`, `POST /todos`, `PATCH /todos/:id`, and `DELETE /todos/:id`.
- Status views use local filtering for the current frontend, though the backend also exposes `GET /todos/active` and `GET /todos/completed`.
- The UI's search, sorting, and pagination are client-side over the records returned by `GET /todos`. The current backend scaffold does not yet implement server-side search or pagination query parameters.

## 5. Why CORS is configured

The Vite frontend runs at `http://localhost:5173`; the Express API runs at `http://localhost:3002`. These are different origins. The backend uses the `cors` package and `CLIENT_ORIGIN` to allow the frontend origin to call the API. Keep the allowed origin specific; do not use `*` with credentialed requests.

## 6. Current backend API contract

### Public

- `POST /auth/register` — body: `{ "email": "...", "password": "..." }`
- `POST /auth/login` — body: `{ "email": "...", "password": "..." }`

Login response includes `data.accessToken` and `data.user`.

### Authenticated

- `GET /todos`
- `GET /todos/:id`
- `POST /todos` — body: `{ "task": "..." }`
- `PATCH /todos/:id` — body may contain `{ "task": "..." }` and/or `{ "completed": true }`
- `DELETE /todos/:id`
- `GET /todos/active`
- `GET /todos/completed`

Admin only:

- `GET /todos/admin/all`

## Notes and limitations

- The frontend stores the access token in `localStorage` for learning convenience. JavaScript-accessible storage is exposed if the page suffers an XSS vulnerability. For production browser apps, consider a secure HttpOnly cookie-based design with appropriate CSRF protection, or another carefully designed token-storage approach.
- The access token expires after the configured lifetime. This starter has no refresh-token or revocation flow; sign out clears the browser's stored session but does not revoke an already-issued token.
- The dashboard performs search, sorting, and pagination in the browser because the current backend scaffold returns the user's full todo list. This is fine for a small learning dataset, not for very large collections. Server-side pagination/search should be added to the backend before scaling.
- The admin view is read-only for todos owned by other users. The backend's normal update/delete endpoints remain ownership-scoped.
- This project is a learning scaffold, not a complete production identity platform. Add automated tests, migrations, logging, refresh/revocation, password recovery, email verification, and deployment hardening before production use.
