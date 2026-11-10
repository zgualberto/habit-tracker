import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  HABIT_STATISTICS_HISTORY_IN_DAYS,
  createHabitRequestSchema,
  type CreateHabitRequest,
  type HabitListingResponse,
  type HabitResponse,
  type HabitStatus,
  type UpdateHabitRequest,
} from '@habit-tracker/contracts';

import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import {
  addDaysToLocalDate,
  getCurrentLocalDate,
} from '../domain/local-date.utility';
import { toHabitResponse } from './habit.mapper';
import { HabitRepository, type HabitWithLogs } from './habit.repository';

@Injectable()
export class HabitService {
  public constructor(private readonly habitRepository: HabitRepository) {}

  public async listHabits(
    authenticatedUser: AuthenticatedUser,
    status: HabitStatus,
  ): Promise<HabitListingResponse> {
    const referenceLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const habits = await this.habitRepository.findManyWithLogs({
      userIdentifier: authenticatedUser.identifier,
      status,
      logsFromLocalDate: this.getStatisticsStartLocalDate(referenceLocalDate),
    });

    return {
      habits: habits.map((habit) => toHabitResponse(habit, referenceLocalDate)),
    };
  }

  public async createHabit(
    authenticatedUser: AuthenticatedUser,
    request: CreateHabitRequest,
  ): Promise<HabitResponse> {
    const referenceLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const habit = await this.habitRepository.create({
      userIdentifier: authenticatedUser.identifier,
      name: request.name,
      description: request.description ?? null,
      cadence: request.cadence,
      weekdays: request.weekdays,
      weeklyTarget: request.weeklyTarget ?? null,
      targetType: request.targetType,
      targetValue: request.targetValue ?? null,
      reminderTime: request.reminderTime ?? null,
    });

    return { habit: toHabitResponse(habit, referenceLocalDate) };
  }

  public async getHabit(
    authenticatedUser: AuthenticatedUser,
    habitIdentifier: string,
  ): Promise<HabitResponse> {
    const referenceLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const habit = await this.findHabitOrThrow(
      authenticatedUser.identifier,
      habitIdentifier,
      referenceLocalDate,
    );
    return { habit: toHabitResponse(habit, referenceLocalDate) };
  }

  public async updateHabit(
    authenticatedUser: AuthenticatedUser,
    habitIdentifier: string,
    request: UpdateHabitRequest,
  ): Promise<HabitResponse> {
    const referenceLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const existingHabit = await this.findHabitOrThrow(
      authenticatedUser.identifier,
      habitIdentifier,
      referenceLocalDate,
    );

    const mergedRequest = {
      name: request.name ?? existingHabit.name,
      description:
        request.description !== undefined ? request.description : existingHabit.description,
      cadence: request.cadence ?? existingHabit.cadence,
      weekdays: request.weekdays ?? existingHabit.weekdays,
      weeklyTarget:
        request.weeklyTarget !== undefined ? request.weeklyTarget : existingHabit.weeklyTarget,
      targetType: request.targetType ?? existingHabit.targetType,
      targetValue:
        request.targetValue !== undefined ? request.targetValue : existingHabit.targetValue,
      reminderTime:
        request.reminderTime !== undefined ? request.reminderTime : existingHabit.reminderTime,
    };

    // The merged result is validated as a whole so that partial updates cannot
    // leave a habit in an inconsistent state.
    const validationResult = createHabitRequestSchema.safeParse(mergedRequest);
    if (!validationResult.success) {
      throw new BadRequestException({
        errorCode: ERROR_CODES.VALIDATION_FAILED,
        message: ERROR_MESSAGES.VALIDATION_FAILED,
        details: validationResult.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`,
        ),
      });
    }

    await this.habitRepository.update(habitIdentifier, {
      name: validationResult.data.name,
      description: validationResult.data.description ?? null,
      cadence: validationResult.data.cadence,
      weekdays: validationResult.data.weekdays,
      weeklyTarget: validationResult.data.weeklyTarget ?? null,
      targetType: validationResult.data.targetType,
      targetValue: validationResult.data.targetValue ?? null,
      reminderTime: validationResult.data.reminderTime ?? null,
    });

    const updatedHabit = await this.findHabitOrThrow(
      authenticatedUser.identifier,
      habitIdentifier,
      referenceLocalDate,
    );

    return { habit: toHabitResponse(updatedHabit, referenceLocalDate) };
  }

  public async archiveHabit(
    authenticatedUser: AuthenticatedUser,
    habitIdentifier: string,
  ): Promise<HabitResponse> {
    const referenceLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const existingHabit = await this.findHabitOrThrow(
      authenticatedUser.identifier,
      habitIdentifier,
      referenceLocalDate,
    );

    if (existingHabit.archivedAt === null) {
      await this.habitRepository.archive(habitIdentifier);
    }

    const archivedHabit = await this.findHabitOrThrow(
      authenticatedUser.identifier,
      habitIdentifier,
      referenceLocalDate,
    );

    return { habit: toHabitResponse(archivedHabit, referenceLocalDate) };
  }

  private async findHabitOrThrow(
    userIdentifier: string,
    habitIdentifier: string,
    referenceLocalDate: string,
  ): Promise<HabitWithLogs> {
    const habit = await this.habitRepository.findByIdentifierWithLogs({
      identifier: habitIdentifier,
      userIdentifier,
      logsFromLocalDate: this.getStatisticsStartLocalDate(referenceLocalDate),
    });

    if (habit === null) {
      throw new NotFoundException({
        errorCode: ERROR_CODES.HABIT_NOT_FOUND,
        message: ERROR_MESSAGES.HABIT_NOT_FOUND,
      });
    }

    return habit;
  }

  private getStatisticsStartLocalDate(referenceLocalDate: string): string {
    return addDaysToLocalDate(referenceLocalDate, -HABIT_STATISTICS_HISTORY_IN_DAYS);
  }
}
