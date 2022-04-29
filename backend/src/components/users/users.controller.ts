import { Body, Controller, Delete, Get, Header, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { RealIP } from 'nestjs-real-ip';
import * as argon2 from 'argon2'
import Errors, { HandleServiceError } from 'src/utility/error';
import { AccessCodeRegex, EmailRegex, PasswordRegex, UsernameRegex } from 'src/utility/regex';
import { CreateUserDTO, LoginDTO } from './users.dtos';
import { INewUser, IUserAuth, IUserSession } from './users.interfaces';
import { UsersService } from './user.service';
import { Auth } from 'src/utility/routeParams';
import { PrismaService } from '../prisma.service';
import { GenerateAccessCode } from 'src/utility/general';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private prisma: PrismaService,
  ) {}

  @Post('accesscodes')
  @Header('content-type', 'application/json')
  async createAccessCode(@Req() req: Request, @Body() body: { access_code: string }, @Auth({ user: 'admin', throw: ['flags', 'token'] }) auth: IUserAuth) {
    //if (!auth.verified_flags) throw Errors.Unauthorized('requires_admin_permission')
    console.log(auth);
    const formattedAccessCode = body.access_code ? body.access_code.toLowerCase() : await GenerateAccessCode();

    if (
      body.access_code &&
      (
        !formattedAccessCode.match(AccessCodeRegex) ||
        (await this.prisma.accessCode.findUnique({ where: { code: formattedAccessCode } }))
      )
    ) throw Errors.BadRequest('access_code_invalid');

    try {
      return await this.prisma.accessCode.create({ data: { code: formattedAccessCode } })
    } catch (err: any) { throw HandleServiceError(err) }
  }

  @Delete('accesscodes')
  @Header('content-type', 'application/json')
  async deleteAccessCode(@Req() req: Request, @Body() body: { access_code: string }, @Auth({ user: 'admin' }) auth: IUserAuth) {
    if (!auth.verified_flags) throw Errors.Unauthorized('requires_admin_permission')
    if (req.headers['content-type'] !== 'application/json') throw Errors.UnsupportedMedia('invalid_content_type');
    if (!body.access_code) throw Errors.BadRequest('access_code_missing');
    const formattedAccessCode = body.access_code.toLowerCase();
    if (!formattedAccessCode.match(AccessCodeRegex) && !(await this.prisma.accessCode.findUnique({ where: { code: formattedAccessCode } }))) throw Errors.BadRequest('access_code_invalid');

    try {
      await this.prisma.accessCode.delete({ where: { code: body.access_code } })
    } catch (err: any) { throw HandleServiceError(err) }
  }

  @Post('register')
  @Header('content-type', 'application/json')
  async createUser(@Req() req: Request, @Body() body: CreateUserDTO): Promise<INewUser> {
    if (req.headers['content-type'] !== 'application/json') throw Errors.UnsupportedMedia('invalid_content_type');
    if (!body.access_code || !body.access_code.match(AccessCodeRegex) || !(await this.prisma.accessCode.findUnique({ where: { code: body.access_code } }))) throw Errors.BadRequest('access_code_invalid');
    if (!body.username || !body.username.match(UsernameRegex)) throw Errors.BadRequest('username_invalid');
    if (!body.email || !body.email.match(EmailRegex)) throw Errors.BadRequest('email_invalid');
    if (!body.password || !body.password.match(PasswordRegex)) throw Errors.BadRequest('password_invalid');

    try {
      const user =  await this.userService.createUser(body.username, body.email, body.password);
      await this.prisma.accessCode.delete({ where: { code: body.access_code } })
      return user;
    } catch (err: any) { throw HandleServiceError(err) }
  }

  @Get('login')
  @Header('content-type', 'application/json')
  async login(@Req() req: Request, @RealIP() ip: string, @Body() body: LoginDTO): Promise<IUserSession> {
    if (req.headers['content-type'] !== 'application/json') throw Errors.UnsupportedMedia('invalid_content_type');
    if (!body.login_id || (!body.login_id.match(UsernameRegex) && !body.login_id.match(EmailRegex))) throw Errors.BadRequest('login_id_invalid');
    if (!body.password || !body.password.match(PasswordRegex)) throw Errors.BadRequest('password_invalid');

    try {
      const formattedLoginID = body.login_id.toLowerCase();

      const user = await this.prisma.user.findFirst({ where: { OR: [
        { email: formattedLoginID },
        { username: formattedLoginID }
      ] } });
      if (!user) throw Errors.BadRequest('login_id_invalid');

      const auth = await argon2.verify(user.password, body.password, { type: argon2.argon2id })
      if (!auth) throw Errors.Unauthorized('password_invalid');

      return await this.userService.createUserSession(user.id, ip, { rememberLogin: body.remember_session });
    } catch (err: any) { throw HandleServiceError(err) }
  }

  @Get('logout')
  async logout(@Req() req: Request, @Body() body: LoginDTO, @Auth({ user: 'user' }) auth: IUserAuth) {
    console.log(auth);

    /*if (req.headers['content-type'] !== 'application/json') throw Errors.UnsupportedMedia('invalid_content_type');
    if (!body.login_id || (!body.login_id.match(UsernameRegex) && !body.login_id.match(EmailRegex))) throw Errors.BadRequest('login_id_invalid');
    if (!body.password || !body.password.match(PasswordRegex)) throw Errors.BadRequest('password_invalid');

    try {
      const formattedLoginID = body.login_id.toLowerCase();

      const user = await this.UserModel.findOne({ $or: [
        { email: formattedLoginID },
        { username: formattedLoginID }
      ] }).exec();
      if (!user) throw Errors.BadRequest('login_id_invalid');

      const auth = await argon2.verify(user.password, body.password, { type: argon2.argon2id })
      if (!auth) throw Errors.Unauthorized('password_invalid');

      return await this.userService.createUserSession(user.id, ip, body.remember_session);
    } catch (err: any) { throw HandleServiceError(err) }*/
  }
}