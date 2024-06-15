import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/grobal-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
