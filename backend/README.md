# Todo API — PostgreSQL + Authentication (ES Modules)

A learning implementation using Express 5, PostgreSQL, Argon2id password hashing, JWT access tokens, authentication middleware, role-based authorization, and per-user todo ownership.

## Requirements

- Node.js 20 or newer
- PostgreSQL running locally or a PostgreSQL connection URL
- npm

## 1. Install dependencies

```bash
npm install
```

The backend includes CORS configured for the Vite frontend at `http://localhost:5173`. Keep `CLIENT_ORIGIN` aligned with the actual frontend origin.

## 2. Create the database

Create a PostgreSQL database named `todo_api`, then run `database/schema.sql` against that database using pgAdmin Query Tool or `psql`.

Example with psql:

```bash
createdb todo_api
psql -d todo_api -f database/schema.sql
```

If `createdb` is not on your PATH, create the database in pgAdmin and run the SQL file from its Query Tool.

## 3. Configure environment variables

Copy `.env.example` to `.env` and set your actual values:

```env
NODE_ENV=development
PORT=3002
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/todo_api
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_ISSUER=todo-api
JWT_AUDIENCE=todo-api
JWT_EXPIRES_IN=15m
```

Generate a JWT secret with:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Do not commit `.env` to Git.

For hosted databases that require TLS, configure `PGSSL=true` only after checking your provider's SSL instructions and certificate requirements. Do not disable certificate verification as a shortcut.

## 4. Start the API

```bash
npm run dev
```

Health check:

```http
GET http://localhost:3002/health
```

## 5. Test registration and login

Register:

```http
POST http://localhost:3002/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "MyStrongPassword123!"
}
```

Login:

```http
POST http://localhost:3002/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "MyStrongPassword123!"
}
```

Copy `data.accessToken` from the login response.

## 6. Test protected Todo routes

Add this header to every `/todos` request:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Create:

```http
POST http://localhost:3002/todos
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "task": "Learn PostgreSQL integration"
}
```

Read your todos:

```http
GET http://localhost:3002/todos
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Read one of your todos:

```http
GET http://localhost:3002/todos/1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Update:

```http
PATCH http://localhost:3002/todos/1
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "completed": true
}
```

Delete:

```http
DELETE http://localhost:3002/todos/1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Other user-scoped endpoints:

- `GET /todos/completed`
- `GET /todos/active`

A user can only read, update, or delete todos that belong to their own account. A request for another user's todo returns 404 to avoid disclosing whether that resource exists.

## 7. Promote a user to admin (manual, trusted operation)

First register a normal account. Then, using pgAdmin or a trusted database console, run:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'user@example.com';
```

The role is loaded from PostgreSQL on every authenticated request, so the change takes effect on the next request made with any still-valid access token. No role value is accepted from the client.

Admin-only endpoint:

```http
GET http://localhost:3002/todos/admin/all
Authorization: Bearer ADMIN_ACCESS_TOKEN
```

Never add a public registration field that lets users choose their own role.

## Architecture

- Routes: declare endpoints and middleware order.
- Middleware: validate input, authenticate JWTs, and authorize roles.
- Controllers: translate HTTP requests into service calls and responses.
- Services: coordinate application rules.
- Repositories: execute parameterized PostgreSQL queries.
- PostgreSQL: persist users and todos and enforce relational constraints.

## Important learning limitations

- This project issues short-lived access tokens only. It does not yet implement refresh tokens, token revocation, password reset, email verification, MFA, or account lockout.
- The login/register rate limiter uses the default in-memory store. For multi-instance production deployments, use a shared rate-limit store.
- Add automated tests, migrations, structured logging, deployment-specific TLS, and a carefully designed token lifecycle before production use.
- The `users` table stores only password hashes. Never return `password_hash` from an API response.
