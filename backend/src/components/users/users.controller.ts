import { Body, Controller, Get, Header, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { RealIP } from 'nestjs-real-ip';
import { Model } from 'mongoose'
import * as argon2 from 'argon2'
import Errors from 'src/utility/error';
import { EmailRegex, PasswordRegex, UsernameRegex } from 'src/utility/regex';
import { User, UserDocument } from './user.schema';
import { CreateUserDTO, LoginDTO } from './users.dtos';
import { INewUser, IUserSession } from './users.interfaces';
import { UsersService } from './users.service';
import { InjectModel } from '@nestjs/mongoose';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    @InjectModel(User.name) private readonly UserModel: Model<UserDocument>
  ) {}

  @Post()
  @Header('content-type', 'application/json')
  async createUser(@Req() req: Request, @Body() body: CreateUserDTO): Promise<INewUser> {
    if (req.headers['content-type'] !== 'application/json') throw Errors.UnsupportedMedia('invalid_content_type');
    if (!body.username || !body.username.match(UsernameRegex)) throw Errors.BadRequest('username_invalid');
    if (!body.email || !body.email.match(EmailRegex)) throw Errors.BadRequest('email_invalid');
    if (!body.password || !body.password.match(PasswordRegex)) throw Errors.BadRequest('password_invalid');

    return await this.userService.createUser(body.username, body.email, body.password);
  }

  @Get('login')
  @Header('content-type', 'application/json')
  async login(@Req() req: Request, @RealIP() ip: string, @Body() body: LoginDTO): Promise<IUserSession> {
    if (req.headers['content-type'] !== 'application/json') throw Errors.UnsupportedMedia('invalid_content_type');
    if (!body.login_id || (!body.login_id.match(UsernameRegex) && !body.login_id.match(EmailRegex))) throw Errors.BadRequest('login_id_invalid');
    if (!body.password || !body.password.match(PasswordRegex)) throw Errors.BadRequest('password_invalid');

    const formattedLoginID = body.login_id.toLowerCase();

    const user = await this.UserModel.findOne({ $or: [
      { email: formattedLoginID },
      { username: formattedLoginID }
    ] }).exec();
    if (!user) throw Errors.BadRequest('login_id_invalid');

    const auth = await argon2.verify(user.password, body.password, { type: argon2.argon2id })
    if (!auth) throw Errors.Unauthorized('password_invalid');

    return await this.userService.createUserSession(user.id, ip, body.remember_session);
  }
}