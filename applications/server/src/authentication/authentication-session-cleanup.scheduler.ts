import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import {
  AUTHENTICATION_SESSION_CLEANUP_CRON_EXPRESSION,
  AUTHENTICATION_SESSION_RETENTION_IN_DAYS,
} from '../common/constants/authentication.constants';
import { AuthenticationSessionRepository } from './authentication-session.repository';

@Injectable()
export class AuthenticationSessionCleanupScheduler {
  private readonly logger = new Logger(AuthenticationSessionCleanupScheduler.name);

  public constructor(
    private readonly authenticationSessionRepository: AuthenticationSessionRepository,
  ) {}

  @Cron(AUTHENTICATION_SESSION_CLEANUP_CRON_EXPRESSION)
  public async deleteStaleSessions(): Promise<void> {
    const staleBefore = new Date(
      Date.now() - AUTHENTICATION_SESSION_RETENTION_IN_DAYS * 24 * 60 * 60 * 1000,
    );
    const deletedCount =
      await this.authenticationSessionRepository.deleteStaleSessions(staleBefore);

    if (deletedCount > 0) {
      this.logger.log(`Deleted ${deletedCount} stale authentication sessions.`);
    }
  }
}
