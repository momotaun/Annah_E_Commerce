import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { assertRequiredEnvVars } from './bootstrap/assert-required-env';

async function bootstrap() {
  // Only actually catches anything when backend/.env doesn't exist (the
  // real production posture — secrets injected by the platform, not a
  // checked-in file). Locally this is a no-op even with a var deleted
  // from backend/.env: @prisma/client independently auto-loads that same
  // file (relative to the schema, not process.cwd()) the moment
  // `./app.module` below is required, which happens before this runs.
  assertRequiredEnvVars();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Without this, SIGTERM (what `docker stop` and Kubernetes both send)
  // falls through to Node's default disposition and kills the process
  // immediately — in-flight requests get cut off and PrismaService's
  // onModuleDestroy never runs to close the database connection cleanly.
  // This makes Nest catch the signal, stop accepting new connections,
  // drain existing ones, then run shutdown lifecycle hooks before exiting.
  app.enableShutdownHooks();

  app.use(helmet());

  // Trust the first proxy hop's X-Forwarded-* headers so the throttler
  // (and anything else keying off req.ip) sees the real client IP when
  // this runs behind a reverse proxy/load balancer, instead of treating
  // every request as coming from the proxy itself.
  app.set('trust proxy', 1);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
