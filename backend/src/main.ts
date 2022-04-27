import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
config();

import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.MONGODB_URI) throw new Error("Couldn't find MONGODB_URI in environment file.");

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 7887);
}
bootstrap();
