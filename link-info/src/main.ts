import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({}));
  const config = new DocumentBuilder()
    .setTitle('Link')
    .setDescription(' ')
    .setVersion('1.0')
    .addTag('Auth')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  if (process.env.PORT_FOR_LOCALHOST) {
    await app.listen(+process.env.PORT_FOR_LOCALHOST);
    const pathUrl = await app.getUrl();
    Logger.log(`Server running at ${pathUrl}/api`);
  } else {
    Logger.error('Missing PORT_FOR_LOCALHOST environment variable');
  }
}

bootstrap().catch((err: unknown) => {
  Logger.error(err);
});
