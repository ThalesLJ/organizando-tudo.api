import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<string>('PORT');
  await app.listen(Number(port));
}

void bootstrap();
