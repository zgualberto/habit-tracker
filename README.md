# Habit Tracker

A full-stack habit and fitness tracker built for the Full Stack Developer exam. It covers the two
required workflows end to end: **build and sustain a habit** and **reflect and stay on track**.

The application is a Vue 3 single-page client backed by a NestJS API, PostgreSQL, and Prisma. The
client and the API share one typed contract package, so a request shape can only be defined once.

- **Client:** Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS v4, Chart.js
- **Server:** NestJS 11, Prisma 6, PostgreSQL 16, Zod (via `nestjs-zod`), JWT in an httpOnly cookie
- **Shared:** `packages/contracts` with Zod schemas, inferred types, route paths, enums, and error codes
- **Infrastructure:** Docker Compose (database + API + nginx), GitHub Actions, Jest, Vitest

## Screens and workflows

| Workflow | Screens |
| --- | --- |
| Build and sustain a habit | Today (`/`), New habit (`/habits/new`), Habit detail (`/habits/:identifier`), Edit habit (`/habits/:identifier/edit`) |
| Reflect and stay on track | Insights (`/insights`), Settings (`/settings`) |
| Account | Sign in (`/login`), Create account (`/register`), Not found (catch-all) |

- **Today** shows every active habit that is scheduled for the person's local date, the daily
  completion progress, and a one-tap check-in. A check-in on a counted habit records its target value.
- **New habit / Edit habit** share the same `HabitForm` component, so daily, selected-weekday, weekly
  target, boolean, counted, and reminder settings behave identically in both places.
- **Habit detail** shows the current streak, longest streak, schedule, target, today's check-in, and
  the check-in history. Habits are archived rather than deleted, which preserves history.
- **Insights** combines habit analytics (completion rate, daily completed vs scheduled chart, per-habit
  breakdown) with page analytics for the signed-in person.
- **Settings** updates the display name and time zone and manages browser push subscriptions.

### Demo account

After seeding, sign in with:

```
email:    demo@habit.app
password: demo1234
```

The seed creates five habits with roughly 60 days of check-in history and 30 days of page views, so
the charts and streaks are populated immediately. Today is intentionally left unchecked.

## Quick start with Docker

The only requirement is Docker with Compose.

```bash
docker compose up --build
```

- Client: <http://localhost:8080>
- API: <http://localhost:8080/api>
- OpenAPI documentation: <http://localhost:8080/api/docs>

The server container applies Prisma migrations on start and waits for the database health check. It
does not seed automatically, so an existing volume is never overwritten. Create the demo data from the
host, using the database port that Compose publishes:

```bash
npm install
npm run contracts:build
npm run database:generate
npm run database:seed
docker compose up --build
```

If the stack is already running, the seed command above still works because PostgreSQL is available on
`localhost:5432`; the API picks up the new rows immediately.

The development VAPID keys in `.env.example` and `docker-compose.yml` are intentionally public demo
keys. Generate real keys for any deployment:

```bash
npm run generate:vapid
```

## Local development

Requirements: Node 24 (`.nvmrc`), npm, and Docker for the database.

```bash
cp applications/server/.env.example applications/server/.env
docker compose up -d database
npm install
npm run contracts:build
npm run database:generate
npm run database:migrate
npm run database:seed
npm run development
```

`npm run development` builds the contracts package and starts the API (`http://localhost:3000`) and
the Vite client (`http://localhost:5173`) together. Vite proxies `/api` to the API, so cookies are
same-origin during development as well.

### Environment variables

All server configuration is validated at startup. Missing or invalid values stop the process with a
readable error rather than failing later at runtime.

| Variable | Purpose |
| --- | --- |
| `NODE_ENVIRONMENT` | `development`, `test`, or `production` |
| `PORT` | API port (default `3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTHENTICATION_JWT_SECRET` | Signing secret for session tokens |
| `CLIENT_ORIGIN` | Allowed CORS origin and cookie origin |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Web Push credentials |
| `ANALYTICS_RETENTION_IN_DAYS` | Daily retention window for analytics events |

## API overview

All routes are under `/api`. Authentication uses an httpOnly cookie named
`habit_tracker_authentication`; the client never reads or stores the token in JavaScript.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Database-aware health probe (503 when PostgreSQL is unreachable) |
| `POST` | `/authentication/register` | Create an account and start a session |
| `POST` | `/authentication/login` | Sign in and start a session |
| `POST` | `/authentication/logout` | Revoke the current session |
| `GET` | `/authentication/me` | Read the current profile |
| `PATCH` | `/authentication/me` | Update display name or time zone |
| `GET` | `/habits?status=active\|archived\|all` | List habits |
| `POST` | `/habits` | Create a habit |
| `GET` | `/habits/:identifier` | Read a habit with streaks |
| `PATCH` | `/habits/:identifier` | Update a habit |
| `DELETE` | `/habits/:identifier` | Archive a habit |
| `GET` | `/habits/:identifier/logs` | List check-ins |
| `PUT` | `/habits/:identifier/logs/:localDate` | Create or replace a check-in |
| `DELETE` | `/habits/:identifier/logs/:localDate` | Remove a check-in |
| `GET` | `/today?localDate=YYYY-MM-DD` | Habits due on a local date |
| `GET` | `/insights?fromLocalDate&toLocalDate` | Habit analytics for a range |
| `POST` | `/analytics-events` | Record a page view (anonymous or attributed) |
| `GET` | `/analytics-summary?fromLocalDate&toLocalDate` | Page analytics for the signed-in person |
| `GET` | `/push-subscriptions` | List the person's push subscriptions |
| `POST` | `/push-subscriptions` | Register or refresh a browser subscription |
| `DELETE` | `/push-subscriptions/:identifier` | Remove a subscription |
| `GET` | `/notifications/configuration` | Whether push is configured, plus the public key |
| `POST` | `/notifications/test` | Send a test push to the person's browsers |

Errors always use the same JSON shape:

```json
{
  "errorCode": "VALIDATION_FAILED",
  "message": "The request contains invalid values.",
  "details": ["name: String must contain at least 1 character(s)"]
}
```

## Security and authentication

- Passwords are hashed with argon2.
- A JWT is stored in an httpOnly, same-site cookie. It carries the user identifier and a
  `sessionIdentifier`.
- Every request verifies the token **and** looks up an active `authentication_session` row. Logout sets
  `revokedAt`, so the same token is rejected afterwards even though its signature is still valid. The
  end-to-end suite covers exactly this replay case.
- Session expiry is checked in the repository query, and expired sessions are cleaned up periodically.
- Ownership is enforced in repositories and services: another person's habit returns `404`, never
  `403`, so identifiers cannot be probed.
- Request payloads are validated with the same Zod schemas that produce the TypeScript types and the
  OpenAPI document.

## Page analytics

The client records a `page_view` for every route change. The endpoint allows anonymous requests, so
the sign-in and registration screens are measurable, and it attributes the event to the person when a
valid session cookie exists.

Summaries are scoped to the signed-in person and bucket events by the person's time zone using SQL
(`("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE $timeZone`). A daily scheduler deletes events older than
`ANALYTICS_RETENTION_IN_DAYS`.

## Push notifications

- Each habit can have a reminder time. The scheduler runs every minute and compares the reminder with
  the person's local time, so reminders follow the person's time zone rather than the server's.
- Reminders are skipped when the habit is already checked in that day.
- A unique `reminder_send(habitIdentifier, localDate)` row acts as a claim, which makes duplicate
  delivery impossible even with more than one API instance.
- Expired browser subscriptions (HTTP 404/410 from the push service) are deleted automatically.
- The service worker handles `push` and `notificationclick`; clicking a reminder focuses an open tab or
  opens the app.

## Database design

The schema is normalised around `user`, `authentication_session`, `habit`, `habit_log`,
`push_subscription`, `reminder_send`, and `analytics_event`. Two migrations add CHECK constraints for
`localDate` (`YYYY-MM-DD`) and `reminderTime` (`HH:mm`) so invalid calendar values cannot reach the
database.

Notable indexes:

- `habit(userIdentifier, archivedAt, createdAt DESC)` supports the habitual "active habits, newest
  first" query.
- `habit_log(habitIdentifier, localDate)` is unique and doubles as the range index for the detail,
  today, and insight queries.
- `analytics_event(userIdentifier, createdAt DESC)` supports user-scoped daily summaries;
  `analytics_event(createdAt)` supports retention deletion.
- `authentication_session(userIdentifier, revokedAt)` and `authentication_session(expiresAt)` keep the
  per-request session lookup and cleanup cheap.

A reproducible benchmark compares a 90-day range query over 100,000 habit logs with and without the
composite index:

| Scenario | Average time | Rows |
| --- | --- | --- |
| Without the composite index | 12.20 ms | 91 |
| With `habit_log(habitIdentifier, localDate)` | 0.82 ms | 91 |

That is roughly **14.9× faster**, and the plan switches to an index-only scan. The methodology, exact
query, `EXPLAIN` output, and rationale are in [`docs/database-performance.md`](docs/database-performance.md).
Re-run it with `npm run benchmark:database`.

## Tests

| Layer | Tool | Coverage |
| --- | --- | --- |
| Contracts | Vitest | Schema and constant behaviour |
| Server domain | Jest | Local dates, schedules, streaks, completion rules |
| Server API | Jest + Supertest | Auth (including revoked-token replay), habits, insights, analytics, notifications, health |
| Client | Vitest + Vue Test Utils | Utilities, stores, and component behaviour |

```bash
npm test                             # contracts + server unit + client
npm run test:end-to-end              # API suite against habit_tracker_test
npm run test:coverage                # server and client coverage
```

End-to-end tests need the test database migrated once:

```bash
docker compose up -d database
cd applications/server
DATABASE_URL="postgresql://habit_tracker:habit_tracker@localhost:5432/habit_tracker_test?schema=public" \
  npx prisma migrate deploy
```

Each end-to-end suite resets the data it owns, and tests run with `--runInBand` against the dedicated
`habit_tracker_test` database. The committed `.env.test` contains only local development values.

## Scripts

| Command | Description |
| --- | --- |
| `npm run development` | Run the API and client with hot reload |
| `npm run build` | Build contracts, API, and client |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm run typecheck` | TypeScript for every workspace |
| `npm test` | Unit and component suites |
| `npm run test:end-to-end` | API end-to-end suite |
| `npm run database:migrate` | Apply migrations |
| `npm run database:seed` | Recreate the demo account and history |
| `npm run benchmark:database` | Run the index benchmark |
| `npm run generate:vapid` | Print a fresh VAPID key pair |

## Project structure

```
applications/
  client/                  Vue 3 application
    src/components/        Reusable presentation and form components
    src/views/             One component per screen
    src/stores/            Pinia state, actions, and loading flags
    src/services/          Typed API calls
    src/utilities/         Dates, errors, charts, push, analytics session
    src/serviceWorker.js   Precache + push + notification click
  server/                  NestJS API
    src/authentication/    Register, login, session whitelist, profile
    src/habit/             Habits, today view, streaks
    src/habit-log/         Check-ins
    src/insight/           Habit analytics
    src/analytics/         Page views, summaries, retention
    src/notification/      Push subscriptions, reminders, scheduler
    src/domain/            Framework-free rules with unit tests
    src/common/            Constants, decorators, guard, filter
    prisma/                Schema, migrations, seed, benchmark
packages/
  contracts/               Shared Zod schemas, types, routes, enums, error codes
docker/                    Dockerfiles and nginx configuration
docs/                      Performance notes
```

## Code standards

The repository follows [`CODE_STYLE.md`](CODE_STYLE.md): complete identifiers everywhere
(`identifier`, not `id`; `authentication/`, not `auth/`), boolean prefixes, controllers that only
handle HTTP, services that own use cases, repositories that own queries, and no repeated literals at
call sites. ESLint enforces identifier length, a deny list of abbreviations, naming conventions, and
Vue rules. Formatting is Prettier.

## Assumptions and trade-offs

- **Sessions are whitelisted**, not just signed. This adds one indexed query per request, which is a
  deliberate trade for immediate logout invalidation.
- **Local dates are strings** (`YYYY-MM-DD`) rather than timestamps. A habit check-in belongs to a
  calendar day, not an instant, and storing it as text makes the intent and the indexes obvious.
- **Archiving instead of deleting** keeps history and analytics coherent; archived habits disappear
  from Today and can still be listed explicitly.
- **The reminder scheduler is minute-granular**, matching the `HH:mm` reminder format. A production
  deployment could swap it for a queue, but the unique claim already makes it multi-instance safe.
- **Page analytics are intentionally lightweight**: one event per route change, a fixed retention
  window, and summaries bucketed in the person's time zone. That keeps the feature useful without
  turning the exam submission into a product-analytics platform.
