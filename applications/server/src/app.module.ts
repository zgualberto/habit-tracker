import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { validateEnvironment } from './configuration/environment.validation';
import { JwtAuthenticationGuard } from './common/guards/jwt-authentication.guard';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { HabitModule } from './habit/habit.module';
import { InsightModule } from './insight/insight.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationModule } from './notification/notification.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthenticationModule,
    HabitModule,
    InsightModule,
    AnalyticsModule,
    NotificationModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthenticationGuard,
    },
  ],
})
export class AppModule {}
