-- CreateEnum
CREATE TYPE "HabitCadence" AS ENUM ('DAILY', 'WEEKDAYS', 'WEEKLY_TARGET');

-- CreateEnum
CREATE TYPE "HabitTargetType" AS ENUM ('BOOLEAN', 'COUNT');

-- CreateTable
CREATE TABLE "user" (
    "identifier" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "authentication_session" (
    "identifier" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authentication_session_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "habit" (
    "identifier" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cadence" "HabitCadence" NOT NULL,
    "weekdays" INTEGER[],
    "weeklyTarget" INTEGER,
    "targetType" "HabitTargetType" NOT NULL DEFAULT 'BOOLEAN',
    "targetValue" INTEGER,
    "reminderTime" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "habit_log" (
    "identifier" TEXT NOT NULL,
    "habitIdentifier" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "completionValue" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_log_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "push_subscription" (
    "identifier" TEXT NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "authentication" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "reminder_send" (
    "identifier" TEXT NOT NULL,
    "habitIdentifier" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_send_pkey" PRIMARY KEY ("identifier")
);

-- CreateTable
CREATE TABLE "analytics_event" (
    "identifier" TEXT NOT NULL,
    "userIdentifier" TEXT,
    "sessionIdentifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_pkey" PRIMARY KEY ("identifier")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "authentication_session_userIdentifier_revokedAt_idx" ON "authentication_session"("userIdentifier", "revokedAt");

-- CreateIndex
CREATE INDEX "authentication_session_expiresAt_idx" ON "authentication_session"("expiresAt");

-- CreateIndex
CREATE INDEX "habit_userIdentifier_archivedAt_createdAt_idx" ON "habit"("userIdentifier", "archivedAt", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "habit_log_habitIdentifier_localDate_key" ON "habit_log"("habitIdentifier", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "push_subscription"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscription_userIdentifier_idx" ON "push_subscription"("userIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_send_habitIdentifier_localDate_key" ON "reminder_send"("habitIdentifier", "localDate");

-- CreateIndex
CREATE INDEX "analytics_event_userIdentifier_createdAt_idx" ON "analytics_event"("userIdentifier", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "analytics_event_createdAt_idx" ON "analytics_event"("createdAt");

-- AddForeignKey
ALTER TABLE "authentication_session" ADD CONSTRAINT "authentication_session_userIdentifier_fkey" FOREIGN KEY ("userIdentifier") REFERENCES "user"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit" ADD CONSTRAINT "habit_userIdentifier_fkey" FOREIGN KEY ("userIdentifier") REFERENCES "user"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_log" ADD CONSTRAINT "habit_log_habitIdentifier_fkey" FOREIGN KEY ("habitIdentifier") REFERENCES "habit"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_userIdentifier_fkey" FOREIGN KEY ("userIdentifier") REFERENCES "user"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_send" ADD CONSTRAINT "reminder_send_habitIdentifier_fkey" FOREIGN KEY ("habitIdentifier") REFERENCES "habit"("identifier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_event" ADD CONSTRAINT "analytics_event_userIdentifier_fkey" FOREIGN KEY ("userIdentifier") REFERENCES "user"("identifier") ON DELETE SET NULL ON UPDATE CASCADE;
