import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './components/authorization/auth.module';
import { UsersModule } from './components/users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10
    }),
    UsersModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthModule.useProvider()
  ]
})
export class AppModule {}
