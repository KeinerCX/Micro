import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop({ required: true })
  author: string;

  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  body: string;

  @Prop([String])
  images: string[];

  @Prop([String])
  flags: string[];

  @Prop()
  posted: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);