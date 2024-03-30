import { Module } from '@nestjs/common';
import { VcService } from './vc.service';

@Module({
  exports: [VcService],
  providers: [VcService],
})
export class VcModule {}
