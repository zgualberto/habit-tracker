import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type RemindableHabit = {
  identifier: string;
  name: string;
  reminderTime: string | null;
  userIdentifier: string;
  userTimeZone: string;
};

type RemindableHabitRow = {
  identifier: string;
  name: string;
  reminderTime: string | null;
  userIdentifier: string;
  userTimeZone: string;
};

@Injectable()
export class ReminderRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findRemindableHabits(): Promise<RemindableHabit[]> {
    const habits = await this.prismaService.habit.findMany({
      where: {
        archivedAt: null,
        reminderTime: { not: null },
        user: { pushSubscriptions: { some: {} } },
      },
      select: {
        identifier: true,
        name: true,
        reminderTime: true,
        userIdentifier: true,
        user: { select: { timeZone: true } },
      },
    });

    return habits.map<RemindableHabit>((habit): RemindableHabitRow => ({
      identifier: habit.identifier,
      name: habit.name,
      reminderTime: habit.reminderTime,
      userIdentifier: habit.userIdentifier,
      userTimeZone: habit.user.timeZone,
    }));
  }

  public async hasCompletion(habitIdentifier: string, localDate: string): Promise<boolean> {
    const logCount = await this.prismaService.habitLog.count({
      where: { habitIdentifier, localDate },
    });
    return logCount > 0;
  }

  /**
   * Reserves the single reminder slot for a habit and calendar day. The unique
   * constraint makes a second concurrent scheduler instance a no-op.
   */
  public async claimReminderSend(
    habitIdentifier: string,
    localDate: string,
  ): Promise<boolean> {
    try {
      await this.prismaService.reminderSend.create({
        data: { habitIdentifier, localDate },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return false;
      }
      throw error;
    }
  }
}
