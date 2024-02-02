import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ResponseExceptionFilter } from './common/filters/response.filter';
import { setupSwagger } from './swagger';
import helmet from 'helmet';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['warn', 'error', 'debug', 'verbose', 'fatal'],
  });
  const configService = app.get(ConfigService);
  // for checking rabbit is connected!
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
    },
  });
  await app.startAllMicroservices();

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
      // {
      //   directives: {
      //     ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      //     'script-src': ["'self'", "'unsafe-inline'", 'sasinnet.ir', 'localhost:3900'],
      //   },
      // },
    }),
  );
  app.setBaseViewsDir(join(__dirname, '../', 'views'));
  app.setViewEngine('hbs');

  // app.useGlobalInterceptors(new ResponseInterceptor()); // moved to rabbitmq module
  app.useGlobalFilters(new ResponseExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('/api/v1');
  app.use(cookieParser(configService.get('JWT_SECRET')));
  // app.use(CookieMiddleware)
  // app.useWebSocketAdapter(new IoAdapter(app));

  setupSwagger(app);

  const port = configService.get('PORT');
  await app.listen(port);
  console.info('------------------------------------------------------------');
  console.info(`| Server started on: http://localhost:${port}              |`);
  console.info(`| Swagger URL:       http://localhost:${port}/sasinnet-site-docs |`);
  console.info(`| Swagger URL [Admin]:       http://localhost:${port}/sasinnet-admin-docs |`);
  console.info('------------------------------------------------------------');
}
bootstrap();
