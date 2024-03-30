import { Module } from '@nestjs/common';
import { VcService } from './vc.service';

@Module({
  providers: [VcService]
})
export class VcModule {}
