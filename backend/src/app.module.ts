import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModel } from './common/entity/product.entity';
import { GiftModel } from './common/entity/gift.entity';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PaginationModule } from './pagination/pagination.module';
import { ImageModule } from './image/image.module';
import { VcModule } from './vc/vc.module';
import { NotificationModule } from './notification/notification.module';
import { ProductModule } from './product/product.module';
import { GiftModule } from './gift/gift.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOSTNAME,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [ProductModel, GiftModel],
      synchronize: true,
    }),
    PaginationModule,
    ImageModule,
    VcModule,
    NotificationModule,
    ProductModule,
    GiftModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
