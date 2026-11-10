import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import {
  API_RESOURCE_PATHS,
  type AnalyticsEventRequest,
  type AnalyticsEventResponse,
  type AnalyticsQuery,
  type AnalyticsSummary,
} from '@habit-tracker/contracts';

import { AUTHENTICATION_COOKIE_NAME } from '../common/constants/authentication.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OptionalAuthentication } from '../common/decorators/optional-authentication.decorator';
import { OptionalCurrentUser } from '../common/decorators/optional-current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import { AnalyticsEventRequestDto, AnalyticsQueryDto } from './analytics.dto';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller(API_RESOURCE_PATHS.ANALYTICS_EVENTS)
export class AnalyticsEventController {
  public constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Public so that visits to the sign-in page are measurable. When a valid
   * session cookie is present the event is also attributed to the user.
   */
  @OptionalAuthentication()
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  public recordEvent(
    @OptionalCurrentUser() authenticatedUser: AuthenticatedUser | undefined,
    @Body() request: AnalyticsEventRequestDto,
  ): Promise<AnalyticsEventResponse> {
    return this.analyticsService.recordEvent(authenticatedUser, request as AnalyticsEventRequest);
  }
}

@ApiTags('Analytics')
@ApiCookieAuth(AUTHENTICATION_COOKIE_NAME)
@Controller(API_RESOURCE_PATHS.ANALYTICS_SUMMARY)
export class AnalyticsSummaryController {
  public constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  public getSummary(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Query() query: AnalyticsQueryDto,
  ): Promise<AnalyticsSummary> {
    return this.analyticsService.getSummary(authenticatedUser, query as AnalyticsQuery);
  }
}
