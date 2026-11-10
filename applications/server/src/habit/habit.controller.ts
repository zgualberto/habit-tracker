import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import {
  API_RESOURCE_PATHS,
  type CreateHabitRequest,
  type HabitListingResponse,
  type HabitLogListingResponse,
  type HabitLogQuery,
  type HabitLogResponse,
  type HabitResponse,
  type UpdateHabitRequest,
  type UpsertHabitLogRequest,
} from '@habit-tracker/contracts';

import { AUTHENTICATION_COOKIE_NAME } from '../common/constants/authentication.constants';
import { HABIT_ROUTE_TEMPLATES } from '../common/constants/habit.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { HabitLogService } from '../habit-log/habit-log.service';
import {
  CreateHabitRequestDto,
  HabitIdentifierParameterDto,
  HabitListingQueryDto,
  HabitLogParameterDto,
  HabitLogQueryDto,
  UpdateHabitRequestDto,
  UpsertHabitLogRequestDto,
} from './habit.dto';
import { HabitService } from './habit.service';

@ApiTags('Habits')
@ApiCookieAuth(AUTHENTICATION_COOKIE_NAME)
@Controller(API_RESOURCE_PATHS.HABITS)
export class HabitController {
  public constructor(
    private readonly habitService: HabitService,
    private readonly habitLogService: HabitLogService,
  ) {}

  @Get()
  public listHabits(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Query() query: HabitListingQueryDto,
  ): Promise<HabitListingResponse> {
    return this.habitService.listHabits(authenticatedUser, query.status);
  }

  @Post()
  public createHabit(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() request: CreateHabitRequestDto,
  ): Promise<HabitResponse> {
    return this.habitService.createHabit(authenticatedUser, request as CreateHabitRequest);
  }

  @Get(HABIT_ROUTE_TEMPLATES.IDENTIFIER)
  public getHabit(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param() parameters: HabitIdentifierParameterDto,
  ): Promise<HabitResponse> {
    return this.habitService.getHabit(authenticatedUser, parameters.identifier);
  }

  @Patch(HABIT_ROUTE_TEMPLATES.IDENTIFIER)
  public updateHabit(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param() parameters: HabitIdentifierParameterDto,
    @Body() request: UpdateHabitRequestDto,
  ): Promise<HabitResponse> {
    return this.habitService.updateHabit(
      authenticatedUser,
      parameters.identifier,
      request as UpdateHabitRequest,
    );
  }

  @Delete(HABIT_ROUTE_TEMPLATES.IDENTIFIER)
  public archiveHabit(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param() parameters: HabitIdentifierParameterDto,
  ): Promise<HabitResponse> {
    return this.habitService.archiveHabit(authenticatedUser, parameters.identifier);
  }

  @Get(HABIT_ROUTE_TEMPLATES.LOGS)
  public listHabitLogs(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param() parameters: HabitIdentifierParameterDto,
    @Query() query: HabitLogQueryDto,
  ): Promise<HabitLogListingResponse> {
    return this.habitLogService.listLogs(
      authenticatedUser,
      parameters.identifier,
      query as HabitLogQuery,
    );
  }

  @Put(HABIT_ROUTE_TEMPLATES.LOG_ENTRY)
  public upsertHabitLog(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param() parameters: HabitLogParameterDto,
    @Body() request: UpsertHabitLogRequestDto,
  ): Promise<HabitLogResponse> {
    return this.habitLogService.upsertLog(
      authenticatedUser,
      parameters.identifier,
      parameters.localDate,
      request as UpsertHabitLogRequest,
    );
  }

  @Delete(HABIT_ROUTE_TEMPLATES.LOG_ENTRY)
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteHabitLog(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param() parameters: HabitLogParameterDto,
  ): Promise<void> {
    return this.habitLogService.deleteLog(
      authenticatedUser,
      parameters.identifier,
      parameters.localDate,
    );
  }
}
