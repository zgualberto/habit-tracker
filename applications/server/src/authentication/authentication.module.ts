import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AUTHENTICATION_TOKEN_EXPIRATION_DURATION } from '../common/constants/authentication.constants';
import { ENVIRONMENT_VARIABLE_NAMES } from '../common/constants/environment.constants';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { AuthenticationSessionRepository } from './authentication-session.repository';
import { AuthenticationSessionCleanupScheduler } from './authentication-session-cleanup.scheduler';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configurationService: ConfigService) => ({
        secret: configurationService.getOrThrow<string>(
          ENVIRONMENT_VARIABLE_NAMES.AUTHENTICATION_JWT_SECRET,
        ),
        signOptions: { expiresIn: AUTHENTICATION_TOKEN_EXPIRATION_DURATION },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    AuthenticationSessionRepository,
    UserRepository,
    AuthenticationSessionCleanupScheduler,
  ],
  exports: [AuthenticationService, AuthenticationSessionRepository, JwtModule],
})
export class AuthenticationModule {}
