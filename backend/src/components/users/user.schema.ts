import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Post, PostSchema } from '../posts/post.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  displayname: string;

  @Prop([String])
  flags: string[];

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  id: string;

  @Prop()
  avatar: string;

  @Prop([PostSchema])
  posts: Post[];

  @Prop({ required: true })
  joined: Date;

  @Prop([String])
  sessions: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);