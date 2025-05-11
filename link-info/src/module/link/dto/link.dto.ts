import { IsNotEmpty, IsUrl, IsUUID } from 'class-validator';

export class LinkDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUrl()
  @IsNotEmpty()
  link: string;
}
