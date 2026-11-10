import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ANALYTICS_EVENT_NAMES } from '@habit-tracker/contracts';

import { PrismaService } from '../database/prisma.service';

export type CreateAnalyticsEventInput = {
  userIdentifier: string | null;
  sessionIdentifier: string;
  name: string;
  path: string;
  metadata: Record<string, unknown> | null;
};

export type AnalyticsTotals = {
  totalPageViews: number;
  uniqueSessionCount: number;
};

export type DailyPageViewCount = {
  localDate: string;
  pageViewCount: number;
};

export type TopPathCount = {
  path: string;
  pageViewCount: number;
};

type CountRow = {
  totalPageViews: number;
  uniqueSessionCount: number;
};

type DailyRow = {
  localDate: string;
  pageViewCount: number;
};

type TopPathRow = {
  path: string;
  pageViewCount: number;
};

@Injectable()
export class AnalyticsRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async create(input: CreateAnalyticsEventInput): Promise<void> {
    await this.prismaService.analyticsEvent.create({
      data: {
        userIdentifier: input.userIdentifier,
        sessionIdentifier: input.sessionIdentifier,
        name: input.name,
        path: input.path,
        metadata:
          input.metadata === null ? Prisma.DbNull : (input.metadata as Prisma.InputJsonValue),
      },
    });
  }

  public async countTotals(
    userIdentifier: string,
    timeZone: string,
    fromLocalDate: string,
    toLocalDate: string,
  ): Promise<AnalyticsTotals> {
    const rows = await this.prismaService.$queryRaw<CountRow[]>`
      SELECT
        COUNT(*)::int AS "totalPageViews",
        COUNT(DISTINCT "sessionIdentifier")::int AS "uniqueSessionCount"
      FROM "analytics_event"
      WHERE "userIdentifier" = ${userIdentifier}
        AND "name" = ${ANALYTICS_EVENT_NAMES.PAGE_VIEW}
        AND (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timeZone})::date
          BETWEEN ${fromLocalDate}::date AND ${toLocalDate}::date
    `;

    return rows[0] ?? { totalPageViews: 0, uniqueSessionCount: 0 };
  }

  public async findDailyPageViewCounts(
    userIdentifier: string,
    timeZone: string,
    fromLocalDate: string,
    toLocalDate: string,
  ): Promise<DailyPageViewCount[]> {
    const rows = await this.prismaService.$queryRaw<DailyRow[]>`
      SELECT
        to_char(
          (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timeZone})::date,
          'YYYY-MM-DD'
        ) AS "localDate",
        COUNT(*)::int AS "pageViewCount"
      FROM "analytics_event"
      WHERE "userIdentifier" = ${userIdentifier}
        AND "name" = ${ANALYTICS_EVENT_NAMES.PAGE_VIEW}
        AND (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timeZone})::date
          BETWEEN ${fromLocalDate}::date AND ${toLocalDate}::date
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows;
  }

  public async findTopPaths(
    userIdentifier: string,
    timeZone: string,
    fromLocalDate: string,
    toLocalDate: string,
    limit: number,
  ): Promise<TopPathCount[]> {
    const rows = await this.prismaService.$queryRaw<TopPathRow[]>`
      SELECT
        "path" AS "path",
        COUNT(*)::int AS "pageViewCount"
      FROM "analytics_event"
      WHERE "userIdentifier" = ${userIdentifier}
        AND "name" = ${ANALYTICS_EVENT_NAMES.PAGE_VIEW}
        AND (("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${timeZone})::date
          BETWEEN ${fromLocalDate}::date AND ${toLocalDate}::date
      GROUP BY 1
      ORDER BY 2 DESC, 1 ASC
      LIMIT ${limit}
    `;

    return rows;
  }

  public async deleteEventsCreatedBefore(cutoffMoment: Date): Promise<number> {
    const deletionResult = await this.prismaService.analyticsEvent.deleteMany({
      where: { createdAt: { lt: cutoffMoment } },
    });
    return deletionResult.count;
  }
}
