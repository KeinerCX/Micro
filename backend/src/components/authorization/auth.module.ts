import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthIntercepter } from 'src/intercepters/authorization';

@Module({})
export class AuthModule {
  static useProvider () {
    return {
      provide: APP_INTERCEPTOR,
      useClass: AuthIntercepter
    }
  }
}
