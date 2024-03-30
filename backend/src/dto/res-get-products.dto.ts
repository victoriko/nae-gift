import { ApiProperty } from '@nestjs/swagger';
import { ProductModel } from 'src/common/entity/product.entity';

export class ResGetProducts {
  @ApiProperty()
  products: ProductModel[];

  @ApiProperty()
  totalPages: number;
}
