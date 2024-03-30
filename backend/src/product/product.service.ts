import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ReqPostProduct } from './dto/req-post-product.dto';
import { ResGetProduct } from './dto/res-get-product.dto';
import { ResPostProduct } from './dto/res-post-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { ReqPayProduct } from './dto/req-pay-product.dto';
import { ResPayProduct } from './dto/res-pay-product.dto';
import { ESCROW_ABI } from 'src/common/abi/escrow.abi';
import { GiftModel } from 'src/common/entity/gift.entity';
import { ImageService } from 'src/services/image/image.service';
import { ReqPutProduct } from './dto/req-put-product.dto';
import { ResPutProduct } from './dto/res-put-product.dto';
import { ReqDeleteProduct } from './dto/req-delete-product.dto';
import { State } from 'src/common/enum/state.enum';
import { ProductModel } from 'src/common/entity/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductModel)
    private readonly productRepo: Repository<ProductModel>,
    @InjectRepository(GiftModel)
    private readonly giftRepo: Repository<GiftModel>,
    private readonly imageService: ImageService,
  ) {}

  async postProduct(
    reqPostProduct: ReqPostProduct,
    file: Express.Multer.File,
  ): Promise<ResPostProduct> {
    const { title, content, price, signature } = reqPostProduct;
    const data = JSON.stringify({ title, content, price });

    const { link } = await this.imageService.uploadImage(file);
    const seller = ethers.utils.verifyMessage(data, signature);

    const product = await this.productRepo.save({
      ...reqPostProduct,
      image: link,
      seller,
    });

    return { id: product.id };
  }

  async getProduct(id: number): Promise<ResGetProduct> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Cannot find product.');

    return product;
  }

  async putProduct(
    id: number,
    reqPutProduct: ReqPutProduct,
    file?: Express.Multer.File,
  ): Promise<ResPutProduct> {
    const product = await this.getProduct(id);
    const { title, content, price, signature } = reqPutProduct;
    const data = JSON.stringify({ title, content, price });

    const seller = ethers.utils.verifyMessage(data, signature);
    if (seller !== product.seller) {
      throw new UnauthorizedException('Cannot update other sellers product.');
    }

    if (file) {
      const { link } = await this.imageService.uploadImage(file);
      product.image = link;
    }

    await this.productRepo.save({
      id: product.id,
      image: product.image,
      ...reqPutProduct,
    });

    return { id: product.id };
  }

  async deleteProduct(id: number, reqDeleteProduct: ReqDeleteProduct) {
    const product = await this.getProduct(id);
    const { title, content, price, signature } = reqDeleteProduct;
    const data = JSON.stringify({ title, content, price });

    const seller = ethers.utils.verifyMessage(data, signature);
    if (seller !== product.seller) {
      throw new UnauthorizedException('Cannot delete other sellers product.');
    }

    await this.productRepo.delete(id);
  }

  async payProduct(
    id: number,
    reqPayProduct: ReqPayProduct,
  ): Promise<ResPayProduct> {
    try {
      const { buyer, receiver, uuid } = reqPayProduct;
      let newGift: GiftModel;

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NETWORK_RPC,
      );
      const contract = new ethers.Contract(
        process.env.PROXY_CONTRACT,
        ESCROW_ABI as any,
        provider,
      );
      console.log('생성 전');
      const eventPromise = new Promise(async (resolve, rej) => {
        console.log('이벤트 대기중');

        const currentBlock = await provider.getBlockNumber();

        const range = 1000;
        const fromBlock = Math.max(currentBlock - range, 0);
        const toBlock = currentBlock + range;

        const allEvents = await contract.queryFilter(
          contract.filters.EscrowCreated(),
          fromBlock,
          toBlock,
        );

        const filteredEvents = allEvents.filter(
          (event) => event.args.uuid === uuid,
        );

        if (filteredEvents.length) {
          console.log('과거 이벤트 발견');

          filteredEvents.forEach(async (event) => {
            console.log(uuid, event.args.uuid, 'UUID 일치 확인');
            const product = await this.getProduct(id);
            newGift = await this.giftRepo.save({
              buyer,
              receiver,
              title: product.title,
              content: product.content,
              image: product.image,
              price: product.price,
              seller: product.seller,
              state: State.ACTIVE,
              contract: event.args.escrowAddress,
            });
            resolve(newGift);
          });
        } else {
          console.log('과거 이벤트 미발견, 이벤트 구독');
          const handler = async (escrowUUID) => {
            console.log('이벤트 발생');
            if (uuid === escrowUUID) {
              console.log('UUID 일치');
              const product = await this.getProduct(id);
              newGift = await this.giftRepo.save({
                buyer,
                receiver,
                title: product.title,
                content: product.content,
                image: product.image,
                price: product.price,
                seller: product.seller,
                state: State.ACTIVE,
                uuid: escrowUUID,
              });
              contract.off('EscrowCreated', handler);
              resolve(newGift);
            }
          };
          contract.on('EscrowCreated', handler);
        }
      });

      const result: any = await eventPromise;
      console.log(result);

      return { giftID: result.id };
    } catch (e) {
      throw new NotAcceptableException('Not enough values or gas.');
    }
  }
}
