import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: ['http://localhost:3000'],
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Nae-Gift')
    .setDescription('Nae-Gift API description')
    .setVersion('0.11.0')
    .addTag('Market')
    .addTag('Market > Product')
    .addTag('Market > Store')
    .addTag('Gift')
    .addTag('VC')
    .addTag('Notification')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.SERVER_PORT || 3000);
}
bootstrap();
