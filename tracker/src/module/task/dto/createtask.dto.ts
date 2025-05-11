import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  taskName: string;

  @ApiProperty()
  @IsNotEmpty()
  taskDescription: string;
}
