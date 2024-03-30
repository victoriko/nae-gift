import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export class ReqReceiveGift {
  @ApiProperty()
  @IsString()
  @Length(132)
  signature: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;
  @ApiProperty()
  @IsString()
  @MinLength(1)
  price: string;
}
