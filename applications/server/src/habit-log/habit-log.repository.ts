import { Injectable } from '@nestjs/common';
import type { HabitLog } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type UpsertHabitLogInput = {
  habitIdentifier: string;
  localDate: string;
  completionValue: number;
  note: string | null;
};

export type FindHabitLogsInput = {
  habitIdentifier: string;
  fromLocalDate: string;
  toLocalDate: string;
};

@Injectable()
export class HabitLogRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public upsert(input: UpsertHabitLogInput): Promise<HabitLog> {
    return this.prismaService.habitLog.upsert({
      where: {
        habitIdentifier_localDate: {
          habitIdentifier: input.habitIdentifier,
          localDate: input.localDate,
        },
      },
      create: input,
      update: {
        completionValue: input.completionValue,
        note: input.note,
      },
    });
  }

  public findByHabitAndLocalDate(
    habitIdentifier: string,
    localDate: string,
  ): Promise<HabitLog | null> {
    return this.prismaService.habitLog.findUnique({
      where: {
        habitIdentifier_localDate: { habitIdentifier, localDate },
      },
    });
  }

  public findManyInRange(input: FindHabitLogsInput): Promise<HabitLog[]> {
    return this.prismaService.habitLog.findMany({
      where: {
        habitIdentifier: input.habitIdentifier,
        localDate: { gte: input.fromLocalDate, lte: input.toLocalDate },
      },
      orderBy: { localDate: 'asc' },
    });
  }

  public async deleteByHabitAndLocalDate(
    habitIdentifier: string,
    localDate: string,
  ): Promise<number> {
    const deletionResult = await this.prismaService.habitLog.deleteMany({
      where: { habitIdentifier, localDate },
    });
    return deletionResult.count;
  }

  public countInRange(
    habitIdentifier: string,
    fromLocalDate: string,
    toLocalDate: string,
  ): Promise<number> {
    return this.prismaService.habitLog.count({
      where: {
        habitIdentifier,
        localDate: { gte: fromLocalDate, lte: toLocalDate },
      },
    });
  }
}
