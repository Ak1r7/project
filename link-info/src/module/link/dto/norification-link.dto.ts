import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class NotificationLinkDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUrl()
  @IsNotEmpty()
  link: string;
}
