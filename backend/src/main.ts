import { NestFactory } from '@nestjs/core';
import dotenv from 'dotenv';
dotenv.config();

import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.MONGODB_URI) throw new Error("Couldn't find MONGODB_URI in environment file.");

  const app = await NestFactory.create(AppModule);
  await app.listen(7887);
}
bootstrap();
