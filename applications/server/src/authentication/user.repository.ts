import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  displayName: string;
  timeZone: string;
};

export type UpdateUserProfileInput = {
  displayName?: string;
  timeZone?: string;
};

@Injectable()
export class UserRepository {
  public constructor(private readonly prismaService: PrismaService) {}

  public findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  public findByIdentifier(identifier: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { identifier } });
  }

  public create(input: CreateUserInput): Promise<User> {
    return this.prismaService.user.create({ data: input });
  }

  public updateProfile(identifier: string, input: UpdateUserProfileInput): Promise<User> {
    return this.prismaService.user.update({ where: { identifier }, data: input });
  }
}
