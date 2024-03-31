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
      console.log(buyer, receiver, uuid);
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NETWORK_RPC,
      );
      console.log(provider);
      const contract = new ethers.Contract(
        process.env.PROXY_CONTRACT,
        ESCROW_ABI,
        provider,
      );
      console.log('Before Deposit');
      const eventPromise = new Promise(async (resolve, rej) => {
        console.log('Waiting for the deposit');

        const currentBlock = await provider.getBlockNumber();

        const range = 1000;
        const fromBlock = Math.max(currentBlock - range, 0);
        const toBlock = currentBlock + range;

        const allEvents = await contract.queryFilter(
          contract.filters.EscrowCreated(),
          fromBlock,
          toBlock,
        );
        console.log(allEvents);

        const filteredEvents = allEvents.filter(
          (event) => event.args.uuid === uuid,
        );

        if (filteredEvents.length) {
          console.log('Active by past event reference.');

          filteredEvents.forEach(async (event) => {
            console.log(uuid, event.args.uuid, 'UUID Confirmation');
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
          console.log('No past events, subscribing to the event.');
          const handler = async (escrowUUID) => {
            console.log('Event Emitted');
            if (uuid === escrowUUID) {
              console.log('UUID Confirmation');
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
