import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ReqPayProduct {
  @ApiProperty()
  @IsString()
  @Length(42)
  buyer: string;

  @ApiProperty()
  @IsString()
  @Length(42)
  receiver: string;

  @ApiProperty()
  @IsString()
  @Length(36)
  uuid: string;
}
