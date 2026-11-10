import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

import {
  ANALYTICS_EVENT_NAMES,
  MILLISECONDS_PER_DAY,
  WEEK_START_WEEKDAY,
  type HabitCadence,
  type HabitTargetType,
} from '@habit-tracker/contracts';

import { ARGON2_HASHING_OPTIONS } from '../src/common/constants/authentication.constants';
import {
  addDaysToLocalDate,
  getCurrentLocalDate,
  getStartOfWeekLocalDate,
} from '../src/domain/local-date.utility';
import { isHabitScheduledOnLocalDate } from '../src/domain/habit-schedule.utility';

const prisma = new PrismaClient();

const DEMO_USER_EMAIL = 'demo@habit.app';
const DEMO_USER_PASSWORD = 'demo1234';
const DEMO_USER_DISPLAY_NAME = 'Demo User';
const DEMO_USER_TIME_ZONE = 'Asia/Manila';
const DEMO_HISTORY_IN_DAYS = 60;
const DEMO_ANALYTICS_HISTORY_IN_DAYS = 30;

type HabitFixture = {
  name: string;
  description: string;
  cadence: HabitCadence;
  weekdays: number[];
  weeklyTarget: number | null;
  targetType: HabitTargetType;
  targetValue: number | null;
  reminderTime: string | null;
  completionProbability: number;
};

const HABIT_FIXTURES: HabitFixture[] = [
  {
    name: 'Morning run',
    description: 'Thirty minutes before breakfast.',
    cadence: 'DAILY',
    weekdays: [],
    weeklyTarget: null,
    targetType: 'BOOLEAN',
    targetValue: null,
    reminderTime: '06:30',
    completionProbability: 0.82,
  },
  {
    name: 'Strength training',
    description: 'Full body session at the gym.',
    cadence: 'WEEKDAYS',
    weekdays: [1, 3, 5],
    weeklyTarget: null,
    targetType: 'BOOLEAN',
    targetValue: null,
    reminderTime: '18:00',
    completionProbability: 0.74,
  },
  {
    name: 'Read twenty pages',
    description: 'Any book, any genre.',
    cadence: 'DAILY',
    weekdays: [],
    weeklyTarget: null,
    targetType: 'COUNT',
    targetValue: 20,
    reminderTime: '21:00',
    completionProbability: 0.68,
  },
  {
    name: 'Drink eight glasses of water',
    description: 'One glass with every meal and between meals.',
    cadence: 'DAILY',
    weekdays: [],
    weeklyTarget: null,
    targetType: 'COUNT',
    targetValue: 8,
    reminderTime: null,
    completionProbability: 0.61,
  },
  {
    name: 'Long walk',
    description: 'At least forty minutes outdoors, three times a week.',
    cadence: 'WEEKLY_TARGET',
    weekdays: [],
    weeklyTarget: 3,
    targetType: 'BOOLEAN',
    targetValue: null,
    reminderTime: null,
    completionProbability: 0.7,
  },
];

const DEMO_PAGE_PATHS = ['/', '/insights', '/settings', '/habits/new'];
const DEFAULT_DEMO_PAGE_PATH = '/';

function createRandomGenerator(seed: number): () => number {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return currentSeed / 4_294_967_296;
  };
}

async function seedDemoUser(): Promise<string> {
  const passwordHash = await argon2.hash(DEMO_USER_PASSWORD, ARGON2_HASHING_OPTIONS);

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: {
      email: DEMO_USER_EMAIL,
      passwordHash,
      displayName: DEMO_USER_DISPLAY_NAME,
      timeZone: DEMO_USER_TIME_ZONE,
    },
    update: {
      passwordHash,
      displayName: DEMO_USER_DISPLAY_NAME,
      timeZone: DEMO_USER_TIME_ZONE,
    },
  });

  return demoUser.identifier;
}

function buildHabitLogs(
  habit: { identifier: string },
  fixture: HabitFixture,
  currentLocalDate: string,
  random: () => number,
): { habitIdentifier: string; localDate: string; completionValue: number }[] {
  const logs: { habitIdentifier: string; localDate: string; completionValue: number }[] = [];
  let completionsInWeek = 0;
  let previousWeekStartLocalDate: string | null = null;

  for (let dayOffset = -DEMO_HISTORY_IN_DAYS; dayOffset <= 0; dayOffset += 1) {
    const localDate = addDaysToLocalDate(currentLocalDate, dayOffset);
    const weekStartLocalDate = getStartOfWeekLocalDate(localDate, WEEK_START_WEEKDAY);

    if (weekStartLocalDate !== previousWeekStartLocalDate) {
      completionsInWeek = 0;
      previousWeekStartLocalDate = weekStartLocalDate;
    }

    // Today is intentionally left open so the demo starts with something to do.
    if (dayOffset === 0) {
      continue;
    }

    const isScheduled = isHabitScheduledOnLocalDate(
      {
        cadence: fixture.cadence,
        weekdays: fixture.weekdays,
        weeklyTarget: fixture.weeklyTarget,
      },
      localDate,
    );
    const isWeeklyTargetAlreadyMet =
      fixture.cadence === 'WEEKLY_TARGET' &&
      completionsInWeek >= (fixture.weeklyTarget ?? 0);

    if (!isScheduled || isWeeklyTargetAlreadyMet || random() >= fixture.completionProbability) {
      continue;
    }

    completionsInWeek += 1;
    logs.push({
      habitIdentifier: habit.identifier,
      localDate,
      completionValue:
        fixture.targetType === 'COUNT' && fixture.targetValue !== null
          ? Math.max(1, Math.round(fixture.targetValue * (0.6 + random() * 0.4)))
          : 1,
    });
  }

  return logs;
}

async function seedHabits(userIdentifier: string): Promise<void> {
  const currentLocalDate = getCurrentLocalDate(DEMO_USER_TIME_ZONE);
  const random = createRandomGenerator(20_261_110);

  for (const [fixtureIndex, fixture] of HABIT_FIXTURES.entries()) {
    const habit = await prisma.habit.create({
      data: {
        userIdentifier,
        name: fixture.name,
        description: fixture.description,
        cadence: fixture.cadence,
        weekdays: fixture.weekdays,
        weeklyTarget: fixture.weeklyTarget,
        targetType: fixture.targetType,
        targetValue: fixture.targetValue,
        reminderTime: fixture.reminderTime,
      },
    });

    const logs = buildHabitLogs(habit, fixture, currentLocalDate, random);

    if (logs.length > 0) {
      await prisma.habitLog.createMany({ data: logs, skipDuplicates: true });
    }

    console.log(
      `Seeded habit ${fixtureIndex + 1}/${HABIT_FIXTURES.length}: ${fixture.name} (${logs.length} logs)`,
    );
  }
}

async function seedAnalyticsEvents(userIdentifier: string): Promise<void> {
  const currentMoment = Date.now();
  const random = createRandomGenerator(20_261_111);
  const events: {
    userIdentifier: string;
    sessionIdentifier: string;
    name: string;
    path: string;
    createdAt: Date;
  }[] = [];

  for (let dayOffset = DEMO_ANALYTICS_HISTORY_IN_DAYS; dayOffset >= 0; dayOffset -= 1) {
    const dayMoment = currentMoment - dayOffset * MILLISECONDS_PER_DAY;
    const pageViewCount = 1 + Math.floor(random() * 4);

    for (let pageViewIndex = 0; pageViewIndex < pageViewCount; pageViewIndex += 1) {
      const pathIndex = Math.floor(random() * DEMO_PAGE_PATHS.length);
      events.push({
        userIdentifier,
        sessionIdentifier: `seed-session-${dayOffset}-${pageViewIndex}`,
        name: ANALYTICS_EVENT_NAMES.PAGE_VIEW,
        path: DEMO_PAGE_PATHS[pathIndex] ?? DEFAULT_DEMO_PAGE_PATH,
        createdAt: new Date(dayMoment - pageViewIndex * 60_000),
      });
    }
  }

  await prisma.analyticsEvent.createMany({ data: events });
  console.log(`Seeded ${events.length} analytics events.`);
}

async function main(): Promise<void> {
  console.log('Seeding the habit tracker database...');
  const userIdentifier = await seedDemoUser();

  // Reset the demo history so the seed is repeatable.
  await prisma.habit.deleteMany({ where: { userIdentifier } });
  await prisma.analyticsEvent.deleteMany({ where: { userIdentifier } });

  await seedHabits(userIdentifier);
  await seedAnalyticsEvents(userIdentifier);

  console.log('');
  console.log('Demo account ready:');
  console.log(`  email:    ${DEMO_USER_EMAIL}`);
  console.log(`  password: ${DEMO_USER_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
