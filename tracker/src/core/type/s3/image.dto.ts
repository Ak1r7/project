import { ApiProperty } from '@nestjs/swagger';

export class SampleDto {
  @ApiProperty({
    description: 'Uploaded Image Files',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  file: Express.Multer.File;
}
