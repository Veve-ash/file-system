import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Role } from "../enum/user.role.enum"


@Schema()
export class User extends Document {
  @Prop({required:true})
  firstName: string

  @Prop({required:true})
  lastName: string

  @Prop({required:true})
  email: string;

  @Prop({required:true})
  password: string;

  @Prop({ enum: Role, default: Role.User })
  role: Role;

@Prop({default:false})
isBlocked:boolean

  @Prop()
  profilePictureUrl:string
}

export const UserSchema = SchemaFactory.createForClass(User);