import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ReqConfirmGift {
  @ApiProperty()
  @IsString()
  @Length(132)
  signature: string;
}
