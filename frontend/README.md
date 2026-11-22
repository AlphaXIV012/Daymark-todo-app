# Daymark Frontend

React + Vite frontend for the Todo API backend in `../backend`.

## Install and run

```bash
npm install
```

Create `.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3002
```

Then run:

```bash
npm run dev
```

Vite normally serves the app at `http://localhost:5173`.

## Backend endpoints used

- `POST /auth/register`
- `POST /auth/login`
- `GET /todos`
- `GET /todos/admin/all` (administrator only)
- `POST /todos`
- `PATCH /todos/:id`
- `DELETE /todos/:id`

The app expects the login response to contain `data.accessToken` and `data.user`. Todo endpoints are expected to return records in `data`.

Search, sorting, filtering and pagination in this first frontend are performed locally against the array returned by `GET /todos`. This matches the current backend scaffold, which does not yet accept server-side listing query parameters.
