import { ApiProperty } from '@nestjs/swagger';

export class ResUploadImage {
  @ApiProperty()
  link: string;
}
