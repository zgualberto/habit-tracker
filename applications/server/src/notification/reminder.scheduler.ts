import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { REMINDER_SCHEDULER_CRON_EXPRESSION } from '../common/constants/notification.constants';
import { getCurrentLocalDate, getLocalTimeForTimeZone } from '../domain/local-date.utility';
import { PushNotificationService } from './push-notification.service';
import { ReminderRepository } from './reminder.repository';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  public constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Cron(REMINDER_SCHEDULER_CRON_EXPRESSION)
  public async sendDueReminders(): Promise<void> {
    const currentMoment = new Date();
    const remindableHabits = await this.reminderRepository.findRemindableHabits();

    for (const habit of remindableHabits) {
      const localTime = getLocalTimeForTimeZone(currentMoment, habit.userTimeZone);

      if (habit.reminderTime !== localTime) {
        continue;
      }

      const localDate = getCurrentLocalDate(habit.userTimeZone, currentMoment);

      if (await this.reminderRepository.hasCompletion(habit.identifier, localDate)) {
        continue;
      }

      // The claim is what makes this safe with more than one server instance.
      if (!(await this.reminderRepository.claimReminderSend(habit.identifier, localDate))) {
        continue;
      }

      try {
        await this.pushNotificationService.sendReminderNotification(habit, localDate);
      } catch (error) {
        this.logger.error(
          `Reminder delivery failed for habit ${habit.identifier}.`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
