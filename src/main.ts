import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';

import { AppModule } from './app.module';
import { NestConfig, SwaggerConfig } from './common/configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  const configService = app.get(ConfigService);
  const nestConfig = configService.get<NestConfig>('nest') as NestConfig;
  const swaggerConfig = configService.get<SwaggerConfig>(
    'swagger',
  ) as SwaggerConfig;

  if (swaggerConfig?.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token',
        },
        'jwt-auth',
      )
      .build();

    logger.log(`Swagger API explorer started on path: /${swaggerConfig.path}`);
    SwaggerModule.setup(
      swaggerConfig.path,
      app,
      SwaggerModule.createDocument(app, options),
      {
        swaggerOptions: {
          operationsSorter: 'alpha',
        },
      },
    );
  }

  if (nestConfig.cors) {
    app.enableCors();
  }

  await app.listen(nestConfig.port);
  logger.log(`Listening started on ${await app.getUrl()}`);
}

bootstrap();
