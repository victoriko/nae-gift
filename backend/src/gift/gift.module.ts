import { Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftModel } from 'src/common/entity/gift.entity';
import { PaginationModule } from 'src/services/pagination/pagination.module';
import { VcModule } from 'src/services/vc/vc.module';
import { NotificationModule } from 'src/services/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GiftModel]),
    PaginationModule,
    VcModule,
    NotificationModule,
  ],
  controllers: [GiftController],
  providers: [GiftService],
})
export class GiftModule {}
