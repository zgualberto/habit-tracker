import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import { API_RESOURCE_PATHS, type TodayResponse } from '@habit-tracker/contracts';

import { AUTHENTICATION_COOKIE_NAME } from '../common/constants/authentication.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { TodayQueryDto } from './habit.dto';
import { TodayService } from './today.service';

@ApiTags('Today')
@ApiCookieAuth(AUTHENTICATION_COOKIE_NAME)
@Controller(API_RESOURCE_PATHS.TODAY)
export class TodayController {
  public constructor(private readonly todayService: TodayService) {}

  @Get()
  public getToday(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Query() query: TodayQueryDto,
  ): Promise<TodayResponse> {
    return this.todayService.getToday(authenticatedUser, query.localDate);
  }
}
