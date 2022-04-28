import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
config();

import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.MONGODB_URI) throw new Error("Couldn't find MONGODB_URI in environment file.");

  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*' } 
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'X-Powered-By',
      'Our awsome supporters and open-source contributors!'
    )
    next()
  })

  await app.listen(process.env.PORT || 7887);
}
bootstrap();
