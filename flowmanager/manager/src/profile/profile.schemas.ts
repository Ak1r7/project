import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsPhoneNumber } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import mongoose, { Schema as MongooSchema } from 'mongoose';

export type ProfileDocument = HydratedDocument<Profile>;

@ObjectType() 
@Schema()
export class Profile {
  @Field(() => String)
  _id: MongooSchema.Types.ObjectId;

  @Field({ nullable: true })
  @Prop({ default: null })
  firstName: string;

  @Field({ nullable: true })
  @Prop({ default: null })
  lastName: string;

  @Field({ nullable: true })
  @Prop({ default: null })
  dateOfBirth: Date;

  @Field({ nullable: true })  
  @IsPhoneNumber()
  @Prop()
  phone: string;

  @Field({ nullable: true })
  @Prop({ default: null })
  gender: string;

  @Field(() => Number, { nullable: true })  
  @Prop()
  verify_code: number;

  @Field(() => Number, { nullable: true })  
  @Prop()
  code_input: number;

  @Field(() => Boolean, { nullable: true })  
  @Prop({ default: false })
  verification: boolean;

  @Field({ nullable: true })
  @Prop({ default: 'light' })
  theme: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
