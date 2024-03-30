import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModel } from './common/entity/product.entity';
import { GiftModel } from './common/entity/gift.entity';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ProductModule } from './product/product.module';
import { GiftModule } from './gift/gift.module';
import { PaginationModule } from './services/pagination/pagination.module';
import { ImageModule } from './services/image/image.module';
import { VcModule } from './services/vc/vc.module';
import { NotificationModule } from './services/notification/notification.module';
import { PaginationService } from './services/pagination/pagination.service';
import { ServeStaticModule } from '@nestjs/serve-static';

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
    TypeOrmModule.forFeature([ProductModel]),
    PaginationModule,
    ImageModule,
    VcModule,
    NotificationModule,
    ProductModule,
    GiftModule,
    ServeStaticModule.forRoot({
      rootPath: `${process.cwd()}/public`,
      serveRoot: '/public',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
