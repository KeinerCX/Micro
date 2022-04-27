import { Body, Controller, Get, Header, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { RealIP } from 'nestjs-real-ip';
import * as Errors from 'src/utility/error';
import { EmailRegex, PasswordRegex, UsernameRegex } from 'src/utility/regex';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService
  ) {}

  @Post()
  @Header('content-type', 'application/json')
  createUser(@Req() req: Request, @RealIP() ip: string, @Body() body: CreateUserDTO): string {
    if (req.headers['content-type'] !== 'application/json') throw Errors.UnsupportedMedia('invalid_content_type');
    if (!body.username || !body.username.match(UsernameRegex)) throw Errors.BadRequest('username_invalid');
    if (!body.email || !body.email.match(EmailRegex)) throw Errors.BadRequest('email_invalid');
    if (!body.password || !body.password.match(PasswordRegex)) throw Errors.BadRequest('password_invalid');

    return this.userService.createUser(body.username, body.email, body.password, ip);
  }
}

//

export class CreateUserDTO {
  username: string
  email: string
  password: string
}