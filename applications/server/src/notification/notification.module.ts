import { Module } from '@nestjs/common';

import { NotificationController, PushSubscriptionController } from './notification.controller';
import { PushNotificationService } from './push-notification.service';
import { PushSubscriptionRepository } from './push-subscription.repository';
import { PushSubscriptionService } from './push-subscription.service';
import { ReminderRepository } from './reminder.repository';
import { ReminderScheduler } from './reminder.scheduler';

@Module({
  controllers: [PushSubscriptionController, NotificationController],
  providers: [
    PushSubscriptionRepository,
    PushSubscriptionService,
    PushNotificationService,
    ReminderRepository,
    ReminderScheduler,
  ],
})
export class NotificationModule {}
