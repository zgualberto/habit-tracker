import { Injectable } from '@nestjs/common';
import type { AuthenticationSession, User } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type AuthenticationSessionWithUser = AuthenticationSession & { user: User };

export type CreateAuthenticationSessionInput = {
  userIdentifier: string;
  userAgent: string | null;
  expiresAt: Date;
};

@Injectable()
export class AuthenticationSessionRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public findActiveWithUser(
    sessionIdentifier: string,
  ): Promise<AuthenticationSessionWithUser | null> {
    return this.prismaService.authenticationSession.findFirst({
      where: {
        identifier: sessionIdentifier,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  public create(input: CreateAuthenticationSessionInput): Promise<AuthenticationSession> {
    return this.prismaService.authenticationSession.create({ data: input });
  }

  public async revoke(identifier: string): Promise<void> {
    await this.prismaService.authenticationSession.updateMany({
      where: { identifier, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  public async deleteStaleSessions(staleBefore: Date): Promise<number> {
    const deletionResult = await this.prismaService.authenticationSession.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: staleBefore } }],
      },
    });
    return deletionResult.count;
  }
}
