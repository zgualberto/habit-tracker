# Database performance

This document records why the habit-log indexes exist and how their effect was measured. The benchmark
is reproducible with `npm run benchmark:database`.

## The workload that matters

Every time somebody opens Today, a habit detail page, or Insights, the API asks a variant of one
question:

> Give me the check-ins for this habit between these two calendar days.

That is the hottest read in the application. It feeds streaks, the today list, the history list, and
the per-habit insight breakdown. The predicate is always `habitIdentifier` plus a `localDate` range:

```sql
SELECT COUNT(*)::int AS rows
FROM habit_log
WHERE "habitIdentifier" = $1
  AND "localDate" BETWEEN $2 AND $3;
```

`localDate` is stored as `YYYY-MM-DD` text on purpose: a check-in belongs to a calendar day, not to an
instant, so range comparisons on the text form are both correct and index-friendly.

## The index

`habit_log` has:

```prisma
@@unique([habitIdentifier, localDate])
```

The unique constraint creates a composite B-tree index on `(habitIdentifier, localDate)`. The column
order matches the query exactly: equality on the first column, range on the second. PostgreSQL can seek
straight to one habit's slice and then walk the date range in order, and because the query only needs
those two columns it can answer from the index alone.

A single-column index on `habitIdentifier` would still fetch heap rows; a single-column index on
`localDate` would scan every habit active in that period. The composite index is the smallest structure
that answers the real query.

Related indexes and their purpose:

| Index                                               | Supports                                                       |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `habit_log(habitIdentifier, localDate)` unique      | Range reads for detail, today, insights, and reminder checks   |
| `habit(userIdentifier, archivedAt, createdAt DESC)` | Active habit listing, newest first                             |
| `authentication_session(userIdentifier, revokedAt)` | Per-request session whitelist lookup                           |
| `authentication_session(expiresAt)`                 | Expired-session cleanup                                        |
| `analytics_event(userIdentifier, createdAt DESC)`   | Person-scoped daily page-view summaries                        |
| `analytics_event(createdAt)`                        | Retention deletion                                             |
| `push_subscription(userIdentifier)`                 | Listing and reminder fan-out                                   |
| `reminder_send(habitIdentifier, localDate)` unique  | One reminder per habit per day, even with concurrent instances |

## Methodology

`applications/server/prisma/benchmark.ts`:

1. Opens a transaction and creates a temporary table shaped like `habit_log`
   (`ON COMMIT DROP`, so real data is never touched).
2. Generates **100 habits × 1,000 days = 100,000 rows** with `generate_series`.
3. Runs the 90-day range query for one habit once as a warm-up, then measures 10 iterations.
4. Runs it again after adding `(habitIdentifier, localDate)` and `ANALYZE`.
5. Prints the average wall-clock time and `EXPLAIN (ANALYZE, BUFFERS)` for the indexed plan.

The same database engine, connection, and query are used in both halves; only the index differs. The
query returns 91 rows in both cases, which confirms the two runs are comparable.

## Results

Measured on PostgreSQL 16 (Docker, local machine):

| Scenario                         | Average time | Rows returned |
| -------------------------------- | ------------ | ------------- |
| Range query without index        | 12.20 ms     | 91            |
| Range query with composite index | 0.82 ms      | 91            |

**≈ 14.9× faster**, and the plan changes to an index-only scan:

```text
Aggregate  (cost=136.83..136.84 rows=1 width=4) (actual time=0.085..0.086 rows=1 loops=1)
  Buffers: local hit=6
  ->  Index Only Scan using benchmark_habit_log_habit_date_idx on benchmark_habit_log
        (cost=0.42..136.65 rows=74 width=0) (actual time=0.023..0.056 rows=91 loops=1)
        Index Cond: (("habitIdentifier" = '...'::text)
          AND ("localDate" >= '2025-06-01'::text)
          AND ("localDate" <= '2025-08-30'::text))
        Heap Fetches: 91
        Buffers: local hit=6
Planning Time: 0.093 ms
Execution Time: 0.107 ms
```

The unindexed plan scans the whole temporary table, which is why its time scales with the total row
count rather than the 91 rows the person actually needs. As data grows, the gap widens; the indexed
plan stays effectively flat for a single habit.

## Operational notes

- **Retention:** analytics events are deleted daily after `ANALYTICS_RETENTION_IN_DAYS`. Habit logs are
  kept because history is the product.
- **Connection pooling:** `DATABASE_URL` sets `connection_limit` and `pool_timeout`, and both are
  explicit in `.env.example` and Compose.
- **N+1 avoidance:** insight queries load habits with their logs in one bounded query and compute
  streaks in the domain layer. The scheduler fetches remindable habits in one query and checks
  completion per candidate only when the reminder minute matches.
- **Write path:** `PUT /habits/:identifier/logs/:localDate` is an upsert on the unique key, so repeated
  taps cannot create duplicate check-ins.
