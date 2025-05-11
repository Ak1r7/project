import { IsEmail, IsString } from 'class-validator';

export class CreateUserGmailDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;
}
