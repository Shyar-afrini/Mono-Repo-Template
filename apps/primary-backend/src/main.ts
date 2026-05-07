import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app.module';
import { EnvelopeExceptionFilter } from './middlewares/envelope-exception.filter';
import { EnvelopeInterceptor } from './middlewares/envelope.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //? Api Prefix
  app.setGlobalPrefix('api');

  //? Cors enabled middleware
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
      ];

      const regex = /^https:\/\/([a-zA-Z0-9-]+\.)*interlinked-dev\.com$/;

      if (!origin || allowed.includes(origin) || regex.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400,
  });

  // ?Global body, cookie transform data and url for m encoded middlewares
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // run class-transformer
      whitelist: true, // strip unknown fields
      transformOptions: { enableImplicitConversion: true }, // honor @Type()
    }),
  );
  app.use(express.json()); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  //? Global success & error interceptors
  app.useGlobalInterceptors(new EnvelopeInterceptor());
  app.useGlobalFilters(new EnvelopeExceptionFilter());

  //? URI Versioning default version 1
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ? Compression
  // const shouldCompress = (req: Request, res: Response) => {
  //   const type = res.getHeader('Content-Type')?.toString() || '';
  //   return /^(?:application\/json|text\/|application\/javascript|text\/css)/.test(
  //     type,
  //   );
  // };
  // app.use(
  //   compression({
  //     level: constants.Z_BEST_SPEED, // or Z_DEFAULT_COMPRESSION
  //     threshold: 1024, // only gzip responses bigger than 1 KB
  //     filter: shouldCompress,
  //   }),
  // );

  await app.listen(3001);
}
bootstrap();
