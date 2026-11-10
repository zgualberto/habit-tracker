import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

import {
  API_RESOURCE_PATHS,
  type CreatePushSubscriptionRequest,
  type NotificationConfiguration,
  type PushSubscriptionListingResponse,
  type PushSubscription,
  type TestNotificationResponse,
} from '@habit-tracker/contracts';

import { AUTHENTICATION_COOKIE_NAME } from '../common/constants/authentication.constants';
import { HTTP_HEADER_NAMES } from '../common/constants/http.constants';
import {
  NOTIFICATION_ROUTE_TEMPLATES,
  PUSH_SUBSCRIPTION_ROUTE_TEMPLATES,
} from '../common/constants/notification.constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-request.type';
import {
  CreatePushSubscriptionRequestDto,
  PushSubscriptionIdentifierParameterDto,
} from './notification.dto';
import { PushNotificationService } from './push-notification.service';
import { PushSubscriptionService } from './push-subscription.service';

@ApiTags('Notifications')
@ApiCookieAuth(AUTHENTICATION_COOKIE_NAME)
@Controller(API_RESOURCE_PATHS.PUSH_SUBSCRIPTIONS)
export class PushSubscriptionController {
  public constructor(private readonly pushSubscriptionService: PushSubscriptionService) {}

  @Get()
  public listSubscriptions(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<PushSubscriptionListingResponse> {
    return this.pushSubscriptionService.listSubscriptions(authenticatedUser);
  }

  @Post()
  public createSubscription(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() request: CreatePushSubscriptionRequestDto,
    @Headers(HTTP_HEADER_NAMES.USER_AGENT) userAgent: string | undefined,
  ): Promise<PushSubscription> {
    return this.pushSubscriptionService.createSubscription(
      authenticatedUser,
      request as CreatePushSubscriptionRequest,
      userAgent,
    );
  }

  @Delete(PUSH_SUBSCRIPTION_ROUTE_TEMPLATES.IDENTIFIER)
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteSubscription(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Param() parameters: PushSubscriptionIdentifierParameterDto,
  ): Promise<void> {
    return this.pushSubscriptionService.deleteSubscription(
      authenticatedUser,
      parameters.identifier,
    );
  }
}

@ApiTags('Notifications')
@ApiCookieAuth(AUTHENTICATION_COOKIE_NAME)
@Controller(API_RESOURCE_PATHS.NOTIFICATIONS)
export class NotificationController {
  public constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Get(NOTIFICATION_ROUTE_TEMPLATES.CONFIGURATION)
  public getConfiguration(): NotificationConfiguration {
    return this.pushNotificationService.getConfiguration();
  }

  @Post(NOTIFICATION_ROUTE_TEMPLATES.TEST)
  public sendTestNotification(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<TestNotificationResponse> {
    return this.pushNotificationService.sendTestNotification(authenticatedUser.identifier);
  }
}
