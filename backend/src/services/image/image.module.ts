import { Module } from '@nestjs/common';
import { ImageService } from './image.service';

@Module({
  exports: [ImageService],
  providers: [ImageService],
})
export class ImageModule {}
