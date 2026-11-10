import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import {
  API_RESOURCE_PATHS,
  type InsightQuery,
  type InsightSummary,
} from '@habit-tracker/contracts';

import { AUTHENTICATION_COOKIE_NAME } from '../common/constants/authentication.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { InsightQueryDto } from './insight.dto';
import { InsightService } from './insight.service';

@ApiTags('Insights')
@ApiCookieAuth(AUTHENTICATION_COOKIE_NAME)
@Controller(API_RESOURCE_PATHS.INSIGHTS)
export class InsightController {
  public constructor(private readonly insightService: InsightService) {}

  @Get()
  public getSummary(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Query() query: InsightQueryDto,
  ): Promise<InsightSummary> {
    return this.insightService.getSummary(authenticatedUser, query as InsightQuery);
  }
}
