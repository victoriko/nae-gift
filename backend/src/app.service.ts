import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductModel } from 'src/common/entity/product.entity';
import { Repository } from 'typeorm';
import { PaginationService } from './services/pagination/pagination.service';
import { ResGetProducts } from './dto/res-get-products.dto';
import { Order } from './common/enum/order.enum';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(ProductModel)
    private productRepository: Repository<ProductModel>,
    private paginationService: PaginationService,
  ) {}

  async getProducts(page: number, order: Order): Promise<ResGetProducts> {
    const take = 5;
    const findAndCount = await this.productRepository.findAndCount({
      take,
      skip: (page - 1) * take,
      order: {
        price: order,
      },
    });

    const { array: products, totalPages } = this.paginationService.pagination(
      findAndCount,
      take,
    );

    return { products, totalPages };
  }
}
