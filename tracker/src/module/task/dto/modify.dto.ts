import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ModifyDto {
  @ApiPropertyOptional()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  comment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional()
  verify?: boolean;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  file?: any;
}
