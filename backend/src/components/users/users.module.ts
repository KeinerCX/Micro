import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './user.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
