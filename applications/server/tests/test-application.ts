import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/application.configuration';
import { PrismaService } from '../src/database/prisma.service';

export const TEST_USER = {
  email: 'tester@habit.app',
  password: 'tester1234',
  displayName: 'Test User',
  timeZone: 'UTC',
} as const;

export const SECONDARY_TEST_USER = {
  email: 'other@habit.app',
  password: 'other1234',
  displayName: 'Other User',
  timeZone: 'UTC',
} as const;

export type TestContext = {
  application: INestApplication;
  prismaService: PrismaService;
  close: () => Promise<void>;
};

export async function createTestContext(): Promise<TestContext> {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const application = testingModule.createNestApplication();
  configureApplication(application, process.env.CLIENT_ORIGIN ?? 'http://localhost:5173');
  await application.init();

  const prismaService = application.get(PrismaService);

  return {
    application,
    prismaService,
    close: async () => {
      await application.close();
    },
  };
}

export async function resetDatabase(prismaService: PrismaService): Promise<void> {
  await prismaService.analyticsEvent.deleteMany();
  await prismaService.user.deleteMany();
}

export function createAgent(application: INestApplication): request.Agent {
  return request.agent(application.getHttpServer());
}

export type TestUser = {
  email: string;
  password: string;
  displayName: string;
  timeZone: string;
};

export async function registerUser(
  agent: request.Agent,
  user: TestUser = TEST_USER,
): Promise<request.Response> {
  return agent.post('/api/authentication/register').send(user);
}
