import { ApiProperty } from '@nestjs/swagger';

export class CreateCodeDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
