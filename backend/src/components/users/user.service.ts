import { HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import { Snowflake } from 'nodejs-snowflake'
import { ServiceError } from 'src/utility/error';
import { CustomEpoch } from 'src/utility/regex';
import { INewUser, IUserSession } from './users.interfaces';
import * as date from 'date-and-time'
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findUser (userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async createUser(username: string, email: string, password: string, flags?: string[]): Promise<INewUser> {
    const formattedEmail = email.toLowerCase();
    const formattedUsername = username.toLowerCase();

    const emails = await this.prisma.user.findUnique({ where: { email: formattedEmail } });
    const usernames = await this.prisma.user.findUnique({ where: { username: formattedUsername } });
  
    if (usernames) throw new ServiceError(HttpStatus.FORBIDDEN, "username_taken");
    if (emails) throw new ServiceError(HttpStatus.FORBIDDEN, "email_taken");

    const user = await this.prisma.user.create({
      data: {
        username: formattedUsername,
        email: formattedEmail,
        flags: ["user"] || flags,
        password: await argon2.hash(password, { type: argon2.argon2id }),
        id: new Snowflake({ custom_epoch: CustomEpoch }).getUniqueID().toString() as string,
        joined: new Date()
      }
    })

    return {
      username: user.username,
      email: user.email,
      displayname: user.displayname,
      flags: user.flags,
      id: user.id,
      joined: user.joined
    }
  }

  async createUserSession(
    user_id: string, 
    client_ip: string, 
    options?: { 
      rememberLogin?: boolean, 
      flags?: string[]
    }
  ): Promise<IUserSession> {
    if (typeof process.env.PRIVATE_KEY === 'string') {
      const data = { 
        user_id,
        client_ip,
        expires: options.rememberLogin ? date.addHours(new Date(), 1) : date.addDays(new Date(), 8),
        flags: options.flags || ["user"],
        token: undefined
      }

      const sessionToken = jwt.sign(
        data, 
        process.env.PRIVATE_KEY, 
        { expiresIn: options.rememberLogin ? '1h' : '8d' }
      )

      data['token'] = sessionToken;
      
      await this.prisma.user.update({ 
        where: { id: user_id }, 
        data: { sessions: { push: sessionToken } }
      })

      return data;
    } else throw new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, "invalid_private_key");
  }
}
