import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*', credentials: false });
  app.setGlobalPrefix('api');
  const port = Number(process.env.BACKEND_PORT || process.env.PORT || 3000);
  await app.listen(port);
}

bootstrap().catch(err => {
  console.error('Server failed to start', err);
  process.exit(1);
});
