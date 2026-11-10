import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { HabitLog } from '@prisma/client';

import {
  ERROR_CODES,
  ERROR_MESSAGES,
  HABIT_LOG_HISTORY_DEFAULT_IN_DAYS,
  HABIT_INSIGHT_MAXIMUM_RANGE_IN_DAYS,
  type HabitLogListingResponse,
  type HabitLogQuery,
  type HabitLogResponse,
  type UpsertHabitLogRequest,
} from '@habit-tracker/contracts';

import {
  addDaysToLocalDate,
  calculateDayDifference,
  getCurrentLocalDate,
  isValidLocalDate,
} from '../domain/local-date.utility';
import { HabitRepository } from '../habit/habit.repository';
import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { HabitLogRepository } from './habit-log.repository';

@Injectable()
export class HabitLogService {
  public constructor(
    private readonly habitLogRepository: HabitLogRepository,
    private readonly habitRepository: HabitRepository,
  ) {}

  public async listLogs(
    authenticatedUser: AuthenticatedUser,
    habitIdentifier: string,
    query: HabitLogQuery,
  ): Promise<HabitLogListingResponse> {
    await this.ensureHabitOwnership(authenticatedUser.identifier, habitIdentifier);

    const currentLocalDate = getCurrentLocalDate(authenticatedUser.timeZone);
    const toLocalDate = query.toLocalDate ?? currentLocalDate;
    const fromLocalDate =
      query.fromLocalDate ?? addDaysToLocalDate(toLocalDate, -HABIT_LOG_HISTORY_DEFAULT_IN_DAYS);

    this.validateLocalDateRange(fromLocalDate, toLocalDate);

    const logs = await this.habitLogRepository.findManyInRange({
      habitIdentifier,
      fromLocalDate,
      toLocalDate,
    });

    return { logs: logs.map((log) => this.toHabitLog(log)) };
  }

  public async upsertLog(
    authenticatedUser: AuthenticatedUser,
    habitIdentifier: string,
    localDate: string,
    request: UpsertHabitLogRequest,
  ): Promise<HabitLogResponse> {
    await this.ensureHabitOwnership(authenticatedUser.identifier, habitIdentifier);
    this.validateCheckInLocalDate(localDate, authenticatedUser.timeZone);

    const log = await this.habitLogRepository.upsert({
      habitIdentifier,
      localDate,
      completionValue: request.completionValue,
      note: request.note ?? null,
    });

    return { log: this.toHabitLog(log) };
  }

  public async deleteLog(
    authenticatedUser: AuthenticatedUser,
    habitIdentifier: string,
    localDate: string,
  ): Promise<void> {
    await this.ensureHabitOwnership(authenticatedUser.identifier, habitIdentifier);

    if (!isValidLocalDate(localDate)) {
      throw this.buildValidationException(['localDate: The local date is not valid.']);
    }

    const deletedCount = await this.habitLogRepository.deleteByHabitAndLocalDate(
      habitIdentifier,
      localDate,
    );

    if (deletedCount === 0) {
      throw new NotFoundException({
        errorCode: ERROR_CODES.HABIT_LOG_NOT_FOUND,
        message: ERROR_MESSAGES.HABIT_LOG_NOT_FOUND,
      });
    }
  }

  private validateCheckInLocalDate(localDate: string, timeZone: string): void {
    if (!isValidLocalDate(localDate)) {
      throw this.buildValidationException(['localDate: The local date is not valid.']);
    }

    const currentLocalDate = getCurrentLocalDate(timeZone);
    if (localDate > currentLocalDate) {
      throw this.buildValidationException([
        'localDate: A habit cannot be completed in the future.',
      ]);
    }
  }

  private validateLocalDateRange(fromLocalDate: string, toLocalDate: string): void {
    if (!isValidLocalDate(fromLocalDate) || !isValidLocalDate(toLocalDate)) {
      throw this.buildValidationException(['The date range contains an invalid date.']);
    }

    if (fromLocalDate > toLocalDate) {
      throw this.buildValidationException([
        'fromLocalDate: The start date must not be after the end date.',
      ]);
    }

    const dayCount = calculateDayDifference(fromLocalDate, toLocalDate);

    if (dayCount > HABIT_INSIGHT_MAXIMUM_RANGE_IN_DAYS) {
      throw this.buildValidationException([
        `The date range cannot exceed ${HABIT_INSIGHT_MAXIMUM_RANGE_IN_DAYS} days.`,
      ]);
    }
  }

  private async ensureHabitOwnership(
    userIdentifier: string,
    habitIdentifier: string,
  ): Promise<void> {
    const habit = await this.habitRepository.findByIdentifier({
      identifier: habitIdentifier,
      userIdentifier,
    });

    if (habit === null) {
      throw new NotFoundException({
        errorCode: ERROR_CODES.HABIT_NOT_FOUND,
        message: ERROR_MESSAGES.HABIT_NOT_FOUND,
      });
    }
  }

  private buildValidationException(details: string[]): BadRequestException {
    return new BadRequestException({
      errorCode: ERROR_CODES.VALIDATION_FAILED,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      details,
    });
  }

  private toHabitLog(log: HabitLog): HabitLogResponse['log'] {
    return {
      identifier: log.identifier,
      habitIdentifier: log.habitIdentifier,
      localDate: log.localDate,
      completionValue: log.completionValue,
      note: log.note,
      createdAt: log.createdAt.toISOString(),
      updatedAt: log.updatedAt.toISOString(),
    };
  }
}
