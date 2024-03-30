import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResGetProducts } from './dto/res-get-products.dto';
import { plainToInstance } from 'class-transformer';
import { Order } from './common/enum/order.enum';

@ApiTags('Main')
@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ type: ResGetProducts })
  @ApiOperation({ summary: 'Get all products (Paginated)' })
  async getProducts(
    @Query('page', ParseIntPipe) page: number,
    @Query('order') order: Order,
  ): Promise<ResGetProducts> {
    const result = this.appService.getProducts(page, order);
    return plainToInstance(ResGetProducts, result);
  }
}
