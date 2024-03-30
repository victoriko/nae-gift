import { ApiProperty } from '@nestjs/swagger';
import { State, stateCode } from 'src/common/enum/state.enum';

export class ResGetState {
  @ApiProperty({ example: stateCode[0] })
  state: State;
}
