import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommentDto {
  @ApiProperty()
  @IsNotEmpty()
  comment: string;
}
