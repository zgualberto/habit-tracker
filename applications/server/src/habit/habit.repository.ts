import { Injectable } from '@nestjs/common';
import { Prisma, type Habit, type HabitLog } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type HabitWithLogs = Habit & { logs: HabitLog[] };

export type FindHabitsInput = {
  userIdentifier: string;
  status: 'active' | 'archived' | 'all';
  logsFromLocalDate: string;
};

export type FindHabitInput = {
  identifier: string;
  userIdentifier: string;
  logsFromLocalDate: string;
};

export type CreateHabitInput = {
  userIdentifier: string;
  name: string;
  description: string | null;
  cadence: Habit['cadence'];
  weekdays: number[];
  weeklyTarget: number | null;
  targetType: Habit['targetType'];
  targetValue: number | null;
  reminderTime: string | null;
};

export type UpdateHabitInput = Partial<Omit<CreateHabitInput, 'userIdentifier'>>;

@Injectable()
export class HabitRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public findManyWithLogs(input: FindHabitsInput): Promise<HabitWithLogs[]> {
    const archivedFilter: Prisma.HabitWhereInput =
      input.status === 'active'
        ? { archivedAt: null }
        : input.status === 'archived'
          ? { archivedAt: { not: null } }
          : {};

    return this.prismaService.habit.findMany({
      where: {
        userIdentifier: input.userIdentifier,
        ...archivedFilter,
      },
      include: {
        logs: {
          where: { localDate: { gte: input.logsFromLocalDate } },
          orderBy: { localDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public findByIdentifierWithLogs(input: FindHabitInput): Promise<HabitWithLogs | null> {
    return this.prismaService.habit.findFirst({
      where: {
        identifier: input.identifier,
        userIdentifier: input.userIdentifier,
      },
      include: {
        logs: {
          where: { localDate: { gte: input.logsFromLocalDate } },
          orderBy: { localDate: 'asc' },
        },
      },
    });
  }

  public findByIdentifier(input: {
    identifier: string;
    userIdentifier: string;
  }): Promise<Habit | null> {
    return this.prismaService.habit.findFirst({
      where: { identifier: input.identifier, userIdentifier: input.userIdentifier },
    });
  }

  public create(input: CreateHabitInput): Promise<HabitWithLogs> {
    return this.prismaService.habit.create({
      data: {
        userIdentifier: input.userIdentifier,
        name: input.name,
        description: input.description,
        cadence: input.cadence,
        weekdays: input.weekdays,
        weeklyTarget: input.weeklyTarget,
        targetType: input.targetType,
        targetValue: input.targetValue,
        reminderTime: input.reminderTime,
      },
      include: { logs: true },
    });
  }

  public update(identifier: string, input: UpdateHabitInput): Promise<Habit> {
    return this.prismaService.habit.update({
      where: { identifier },
      data: input,
    });
  }

  public archive(identifier: string): Promise<Habit> {
    return this.prismaService.habit.update({
      where: { identifier },
      data: { archivedAt: new Date() },
    });
  }
}
