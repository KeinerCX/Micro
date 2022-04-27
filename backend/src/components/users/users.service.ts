import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  createUser(username: string, email: string, password: string, ip: string): string {
    return 'Hello World!';
  }
}
