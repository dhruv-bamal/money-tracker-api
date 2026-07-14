# Money Tracker API

A REST API for a personal expense tracker, built with Node, Express, and
PostgreSQL. Handles authentication, per-user data isolation, and
server-side spending analysis for the
[Money Tracker](https://github.com/dhruv-bamal/money-tracker-next) frontend.

**Live:** https://money-tracker-api-xxxx.onrender.com

> ⏱️ Hosted on Render's free instance type, which spins down after 15
> minutes of inactivity. The first request after idle takes 30–60 seconds.

---

## Architecture

```
                            System Architecture

                        ┌─────────────────────────┐
                        │     Next.js Frontend    │
                        │    React + TypeScript   │
                        │        (Vercel)         │
                        └───────────┬─────────────┘
                                    │
                       HTTPS • REST API • Bearer JWT
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │   Express Backend API   │
                        │    Node.js + Express    │
                        │        (Render)         │
                        └───────────┬─────────────┘
                                    │
                         Parameterized SQL Queries
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │       PostgreSQL        │
                        │       (Supabase)        │
                        └─────────────────────────┘
```

Every route under `/api/transactions` and `/api/summary` requires a valid
JWT and only ever operates on the requesting user's own data.

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL (via Supabase) |
| DB access | `pg` (node-postgres), raw parameterized SQL |
| Auth | `bcryptjs` + `jsonwebtoken` |
| Deployment | Render |

---

## Project structure

```
server.js              # app setup, middleware, route mounts
db.js                  # pg connection Pool + NUMERIC type parser
middleware/auth.js      # JWT verification middleware
routes/
├── auth.js              # signup, login
├── transactions.js       # GET, POST, DELETE
└── summary.js             # GET — aggregated spending data
lib/logic.js             # categorize, totalByCategory, detectRecurring
```

---

## Database schema

```sql
CREATE TABLE users (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        NOT NULL UNIQUE,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount     numeric     NOT NULL,
  merchant   text        NOT NULL,
  date       date        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

- `id` columns are DB-generated (`gen_random_uuid()`) — the database owns identity.
- `amount` is `numeric`, never `float` — exact decimal arithmetic for money.
- `user_id` is a foreign key with `ON DELETE CASCADE`.
- `category` is not a stored column — derived at read-time by `categorize()`.

Full statements: [`db/schema.sql`](./db/schema.sql).

---

## Authentication

- **Signup** hashes the password with bcrypt (cost factor 10) before
  storing it — the plain password is never persisted or logged.
- **Login** compares the submitted password with `bcrypt.compare()`, and
  returns the same error message whether the email doesn't exist or the
  password is wrong, preventing user enumeration.
- Both return a JWT (`HS256`, 7-day expiry) containing only `{ userId }` —
  the payload is base64-encoded, not encrypted.
- `middleware/auth.js` verifies the token's signature and attaches
  `req.user.id` for route handlers to use.
- Every query in `transactions.js`/`summary.js` is scoped `WHERE user_id =
  $1` using `req.user.id` — enforced at the database query level. A user
  cannot read, modify, or delete another user's data.

---

## API contract

Base URL (production): `https://money-tracker-api-xxxx.onrender.com`
Base URL (local): `http://localhost:3001`

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.

### `POST /api/auth/signup`
```json
{ "email": "alice@example.com", "password": "supersecret123" }
```
**201:** `{ "token": "...", "user": { "id", "email", "created_at" } }`
**400:** missing fields, or password under 8 characters.
**409:** email already registered.

### `POST /api/auth/login`
```json
{ "email": "alice@example.com", "password": "supersecret123" }
```
**200:** `{ "token": "...", "user": { "id", "email" } }`
**401:** invalid email or password (identical message for both cases).

### `GET /api/transactions`
Returns all transactions for the authenticated user, newest first, each
enriched with a derived `category`.
**200:**
```json
[{ "id", "user_id", "amount": 450, "merchant": "Swiggy", "date": "2026-06-01", "created_at", "category": "Food" }]
```

### `POST /api/transactions`
```json
{ "amount": 200, "merchant": "Dunzo", "date": "2026-06-20" }
```
**201:** the created row, including generated `id` and `category`.
**400:** missing fields, non-positive amount, blank merchant, or invalid date.

### `DELETE /api/transactions/:id`
Scoped to `id` **and** the authenticated user.
**204:** success, empty body.
**404:** no matching transaction (id doesn't exist, or belongs to another user).

### `GET /api/summary`
```json
{
  "totalByCategory": { "Food": 1100, "Transport": 250, "Subscriptions": 398, "Shopping": 1200, "Bills": 500, "Other": 0 },
  "recurring": [{ "merchant": "netflix", "amount": 199, "count": 2 }],
  "transactionCount": 10,
  "totalSpent": 4296
}
```

---

## Running locally

```bash
git clone https://github.com/dhruv-bamal/money-tracker-api.git
cd money-tracker-api
npm install
cp .env.example .env
npm run dev
```

```
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
PORT=3001
```

- **`DATABASE_URL`** — use Supabase's session pooler connection string, not
  the direct connection.
- **`JWT_SECRET`** — generate a real value:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **`FRONTEND_URL`** — must exactly match the calling frontend's origin (no
  trailing slash) or CORS blocks every browser request.

Set up the database by running `db/schema.sql` then `db/seed.sql` in
Supabase's SQL editor.

A full Thunder Client collection (happy paths, validation failures,
multi-user isolation checks) is exported at
[`thunder-collection.json`](./thunder-collection.json).

---

## Known tradeoffs

- No refresh-token rotation or server-side revocation — a JWT is valid for
  its full 7-day life once issued.
- No rate limiting on signup/login yet.
- Single connection pool, no read replicas — fine at this scale.

---

## What I learned

Designing `transactions.user_id` as a foreign key from the start meant that
adding real authentication later was a matter of swapping one hardcoded
constant for `req.user.id` in about ten places, not a rewrite. I also
learned the hard way that `pg` returns Postgres `NUMERIC` columns as
JavaScript strings, not numbers — which silently broke spending totals via
string concatenation until I found and fixed it with a custom type parser.
