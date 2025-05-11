import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  comment: string;
}
