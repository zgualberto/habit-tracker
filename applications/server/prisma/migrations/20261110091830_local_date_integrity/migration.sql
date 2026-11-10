-- Guard the calendar-date columns at the database level. Prisma cannot express
-- CHECK constraints in schema.prisma, so the rule lives in this migration.
ALTER TABLE "habit_log"
  ADD CONSTRAINT "habit_log_local_date_format_check"
  CHECK ("localDate" ~ '^\d{4}-\d{2}-\d{2}$');

ALTER TABLE "reminder_send"
  ADD CONSTRAINT "reminder_send_local_date_format_check"
  CHECK ("localDate" ~ '^\d{4}-\d{2}-\d{2}$');
