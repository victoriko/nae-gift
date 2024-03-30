import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  // imports: [],
  exports: [NotificationService],
  providers: [NotificationService],
})
export class NotificationModule {}
