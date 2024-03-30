import { ApiProperty } from '@nestjs/swagger';

export class ResGetGifts {
  @ApiProperty()
  gifts: any[];

  @ApiProperty({ example: 1 })
  totalPages: number;
}
