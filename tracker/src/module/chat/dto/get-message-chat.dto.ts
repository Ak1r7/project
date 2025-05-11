import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  user: string;
}
