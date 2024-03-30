import { ApiProperty } from '@nestjs/swagger';

export class ResGetProduct {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  price: string;

  @ApiProperty()
  seller: string;
}
