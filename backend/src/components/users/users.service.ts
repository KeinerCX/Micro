import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose'
import * as argon2 from 'argon2'
import * as jwt from 'jsonwebtoken'
import { Snowflake } from 'nodejs-snowflake'
import { ServiceError } from 'src/utility/error';
import { CustomEpoch } from 'src/utility/regex';
import { INewUser, IUserSession } from './users.interfaces';
import * as date from 'date-and-time'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>
  ) {}

  async createUser(username: string, email: string, password: string): Promise<INewUser> {
    const formattedEmail = email.toLowerCase();
    const formattedUsername = username.toLowerCase();

    const emails = await this.UserModel.find({
      email: formattedEmail,
    }).exec()
    const usernames = await this.UserModel.find({
      username: formattedUsername,
    }).exec()
  
    if (usernames.length > 0) throw new ServiceError(HttpStatus.FORBIDDEN, "username_taken");
    if (emails.length > 0) throw new ServiceError(HttpStatus.FORBIDDEN, "email_taken");

    const user = new this.UserModel({
      username: formattedUsername,
      email: formattedEmail,
      password: await argon2.hash(password, { type: argon2.argon2id }),
      id: new Snowflake({ custom_epoch: CustomEpoch }).getUniqueID().toString() as string,
      joined: new Date()
    })
    await user.save()

    return {
      username: user.username,
      email: user.email,
      displayname: user.displayname,
      id: user.id,
      joined: user.joined
    }
  }

  async createUserSession(user_id: string, client_ip: string, rememberLogin?: boolean): Promise<IUserSession> {
    if (typeof process.env.PRIVATE_KEY === 'string') {
      const sessionToken = jwt.sign(
        { 
          user_id, 
          client_ip 
        }, 
        process.env.PRIVATE_KEY, 
        { expiresIn: rememberLogin ? '1h' : '8d' }
      )
      
      await this.UserModel.updateOne({ id: user_id }, { $push: { sessions: sessionToken } })
      return {
        user_id,
        token: sessionToken,
        expires: rememberLogin ? date.addHours(new Date(), 1) : date.addDays(new Date(), 8)
      }
    } else throw new ServiceError(HttpStatus.INTERNAL_SERVER_ERROR, "invalid_private_key");
  }
}
