import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { API_BASE_PATH } from '@habit-tracker/contracts';

import { AppModule } from './app.module';
import { configureApplication } from './application.configuration';
import {
  AUTHENTICATION_COOKIE_NAME,
} from './common/constants/authentication.constants';
import {
  ENVIRONMENT_VARIABLE_NAMES,
} from './common/constants/environment.constants';
import {
  SWAGGER_DOCUMENT_DESCRIPTION,
  SWAGGER_DOCUMENT_TITLE,
  SWAGGER_DOCUMENT_VERSION,
} from './common/constants/http.constants';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const application = await NestFactory.create(AppModule);
  const configurationService = application.get(ConfigService);

  configureApplication(
    application,
    configurationService.getOrThrow<string>(ENVIRONMENT_VARIABLE_NAMES.CLIENT_ORIGIN),
  );

  const openApiConfiguration = new DocumentBuilder()
    .setTitle(SWAGGER_DOCUMENT_TITLE)
    .setDescription(SWAGGER_DOCUMENT_DESCRIPTION)
    .setVersion(SWAGGER_DOCUMENT_VERSION)
    .addCookieAuth(AUTHENTICATION_COOKIE_NAME)
    .build();

  const openApiDocument = SwaggerModule.createDocument(application, openApiConfiguration);
  SwaggerModule.setup(
    `${API_BASE_PATH}/docs`,
    application,
    cleanupOpenApiDoc(openApiDocument),
  );

  const port = configurationService.getOrThrow<number>(ENVIRONMENT_VARIABLE_NAMES.PORT);
  await application.listen(port);
  logger.log(`HTTP server listening on port ${port}`);
  logger.log(`OpenAPI documentation available at ${API_BASE_PATH}/docs`);
}

void bootstrap();
