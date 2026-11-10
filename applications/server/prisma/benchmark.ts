import { PrismaClient } from '@prisma/client';

/**
 * Compares the habit-log range query with and without the composite index.
 * The measurement runs against a temporary table that mirrors the real column
 * layout, so the benchmark never touches production data and is always safe to
 * re-run.
 */
const prisma = new PrismaClient();

const HABIT_COUNT = 100;
const DAY_COUNT = 1_000;
const MEASUREMENT_ITERATIONS = 10;
const SAMPLE_HABIT_INDEX = 42;

type TimingResult = {
  label: string;
  averageMilliseconds: number;
  rows: number;
};

function buildHabitIdentifier(habitIndex: number): string {
  return `00000000-0000-0000-0000-${habitIndex.toString().padStart(12, '0')}`;
}

async function measureQuery(
  label: string,
  query: () => Promise<{ rows: number }>,
): Promise<TimingResult> {
  let totalMilliseconds = 0;
  let rowCount = 0;

  // One warm-up run keeps first-call planning overhead out of the average.
  const warmUpResult = await query();
  rowCount = warmUpResult.rows;

  for (let iterationIndex = 0; iterationIndex < MEASUREMENT_ITERATIONS; iterationIndex += 1) {
    const startMoment = performance.now();
    const result = await query();
    totalMilliseconds += performance.now() - startMoment;
    rowCount = result.rows;
  }

  return {
    label,
    averageMilliseconds: totalMilliseconds / MEASUREMENT_ITERATIONS,
    rows: rowCount,
  };
}

async function main(): Promise<void> {
  console.log('Running the habit log index benchmark...');
  console.log(
    `Dataset: ${HABIT_COUNT.toLocaleString()} habits x ${DAY_COUNT.toLocaleString()} days = ${(HABIT_COUNT * DAY_COUNT).toLocaleString()} rows.`,
  );
  console.log('');

  const results = await prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRawUnsafe(`
        CREATE TEMPORARY TABLE benchmark_habit_log (
          identifier text PRIMARY KEY,
          "habitIdentifier" text NOT NULL,
          "localDate" text NOT NULL,
          "completionValue" integer NOT NULL
        ) ON COMMIT DROP
      `);

      await transaction.$executeRawUnsafe(`
        INSERT INTO benchmark_habit_log (identifier, "habitIdentifier", "localDate", "completionValue")
        SELECT
          md5(habit_index || ':' || day_index),
          '00000000-0000-0000-0000-' || lpad(habit_index::text, 12, '0'),
          to_char(date '2024-01-01' + day_index, 'YYYY-MM-DD'),
          CASE WHEN day_index % 3 = 0 THEN 1 ELSE 0 END
        FROM generate_series(1, ${HABIT_COUNT}) AS habit_index
        CROSS JOIN generate_series(0, ${DAY_COUNT - 1}) AS day_index
      `);

      const sampleHabitIdentifier = buildHabitIdentifier(SAMPLE_HABIT_INDEX);
      const rangeQuery = `
        SELECT COUNT(*)::int AS rows
        FROM benchmark_habit_log
        WHERE "habitIdentifier" = '${sampleHabitIdentifier}'
          AND "localDate" BETWEEN '2025-06-01' AND '2025-08-30'
      `;

      const withoutIndex = await measureQuery('Range query without index', async () => {
        const queryResult =
          await transaction.$queryRawUnsafe<{ rows: number }[]>(rangeQuery);
        return { rows: queryResult[0]?.rows ?? 0 };
      });

      await transaction.$executeRawUnsafe(`
        CREATE INDEX benchmark_habit_log_habit_date_idx
        ON benchmark_habit_log ("habitIdentifier", "localDate")
      `);
      await transaction.$executeRawUnsafe('ANALYZE benchmark_habit_log');

      const withIndex = await measureQuery('Range query with index', async () => {
        const queryResult =
          await transaction.$queryRawUnsafe<{ rows: number }[]>(rangeQuery);
        return { rows: queryResult[0]?.rows ?? 0 };
      });

      const indexedPlan = await transaction.$queryRawUnsafe<{ 'QUERY PLAN': unknown }[]>(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${rangeQuery}`,
      );

      return { withoutIndex, withIndex, indexedPlan };
    },
    { timeout: 120_000 },
  );

  const improvementRatio =
    results.withoutIndex.averageMilliseconds / results.withIndex.averageMilliseconds;

  console.log('| Scenario | Average time | Rows returned |');
  console.log('| --- | --- | --- |');
  console.log(
    `| ${results.withoutIndex.label} | ${results.withoutIndex.averageMilliseconds.toFixed(2)} ms | ${results.withoutIndex.rows} |`,
  );
  console.log(
    `| ${results.withIndex.label} | ${results.withIndex.averageMilliseconds.toFixed(2)} ms | ${results.withIndex.rows} |`,
  );
  console.log('');
  console.log(
    `The composite index made the range query about ${improvementRatio.toFixed(1)}x faster.`,
  );
  console.log('');
  console.log('Indexed plan:');
  for (const planRow of results.indexedPlan) {
    console.log(`  ${String(planRow['QUERY PLAN'])}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
