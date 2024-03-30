import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResGetState } from './dto/res-get-state.dto';
import { ethers } from 'ethers';
import { ESCROW_ABI } from 'src/common/abi/escrow.abi';
import { State, stateCode } from 'src/common/enum/state.enum';
import { GiftModel } from 'src/common/entity/gift.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResGetGifts } from './dto/res-get-gifts.dto';
import { PaginationService } from 'src/services/pagination/pagination.service';
import { Order } from 'src/common/enum/order.enum';
import {
  MinimalUnsignedCredential,
  QueryCredentialsRequestResult,
} from '@blockchain-lab-um/masca-connector';
import { VerifiableCredential } from '@veramo/core';
import { ReqReceiveGift } from './dto/req-receive-gift.dto';
import { VcService } from 'src/services/vc/vc.service';
import { NotificationService } from 'src/services/notification/notification.service';

@Injectable()
export class GiftService {
  constructor(
    @InjectRepository(GiftModel)
    private readonly giftRepo: Repository<GiftModel>,
    private readonly paginationService: PaginationService,
    private readonly vcService: VcService,
    private readonly notificationService: NotificationService,
  ) {}

  async getGift(id: number): Promise<GiftModel> {
    const gift = await this.giftRepo.findOne({ where: { id } });
    if (!gift) throw new NotFoundException('Cannot find gift.');

    return gift;
  }

  async getGifts(
    buyer: string,
    receiver: string,
    page: number,
    order: Order,
  ): Promise<ResGetGifts> {
    const take = 3;
    const skip = take * (page - 1);
    const findAndCount = await this.giftRepo.findAndCount({
      where: receiver ? { receiver } : { buyer },
      order: { id: order },
      take,
      skip,
    });

    const { array: gifts, totalPages } = this.paginationService.pagination(
      findAndCount,
      take,
    );

    return { gifts, totalPages };
  }

  async getState(id: number): Promise<ResGetState> {
    const gift = await this.getGift(id);
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NETWORK_RPC,
    );
    const escrow = new ethers.Contract(
      process.env.PROXY_CONTRACT,
      ESCROW_ABI,
      provider,
    );

    const code = Number(await escrow.escrowStatus(gift.uuid));

    return { state: stateCode[code] };
  }

  async checkSavedCredential(id: number, saveResponse: { success: boolean }) {
    console.log(saveResponse);
    if (saveResponse.success) {
      await this.giftRepo.update(id, { state: State.ISSUED });
      return { success: true };
    } else {
      return { success: false };
    }
  }

  async receiveGift(
    id: number,
    reqReceiveGift: ReqReceiveGift,
  ): Promise<VerifiableCredential> {
    const gift = await this.getGift(id);

    if (gift.state === State.ISSUED)
      throw new BadRequestException(
        'The gift was already issued and received.',
      );

    const message = {
      title: reqReceiveGift.title,
      content: reqReceiveGift.content,
      price: reqReceiveGift.price,
    };

    const signature = reqReceiveGift.signature;

    const signer = ethers.utils.verifyMessage(
      JSON.stringify(message),
      signature,
    );
    if (signer !== gift.receiver)
      throw new UnauthorizedException('Invalid signature.');

    const agent = await this.vcService.getAgent();

    await agent.didManagerGetOrCreate({
      alias: 'market',
    });

    const identifier = await agent.didManagerGetByAlias({
      alias: 'market',
    });

    const payload: MinimalUnsignedCredential = {
      type: ['VerifiableCredential', 'DigitalVoucher'],
      issuer: { id: identifier.did },
      credentialSubject: {
        id: `did:ethr:${process.env.TARGET_CHAINID}:${gift.receiver}`,
        type: 'DigitalVoucher',
        giftID: gift.id,
        contract: gift.uuid,
        buyer: gift.buyer,
        receiver: gift.receiver,
        title: gift.title,
        content: gift.content,
        image: gift.image,
        price: gift.price,
        seller: gift.seller,
      },
      credentialStatus: {
        type: 'StatusList2021Entry',
        id: `${process.env.HOST}/gift/${gift.id}/credentialStatus`,
      },
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      proofFormat: 'EthereumEip712Signature2021',
    };

    const verifiableCredential = await agent.createVerifiableCredential({
      credential: payload,
      proofFormat: 'EthereumEip712Signature2021',
    });

    // const status = await agent.checkCredentialStatus({
    //   credential: verifiableCredential,
    //   didDocumentOverride: { id: identifier.did },
    // });
    // console.log('Is this revoked?', status);

    // const result = await agent.verifyCredential({
    //   credential: verifiableCredential,
    // });
    // console.log('Is this verified? ', result);

    return verifiableCredential;
  }

  async verifyCredential(id: number, VcRes: QueryCredentialsRequestResult) {
    const agent = await this.vcService.getAgent();
    const verifiableCredential = VcRes.data as VerifiableCredential;

    const status = await agent.checkCredentialStatus({
      credential: verifiableCredential,
    });
    console.log('Is this revoked?', status);

    if (status.revoked) throw new UnauthorizedException('Revoked.');

    const verificationResult = await agent.verifyCredential({
      credential: verifiableCredential,
    });

    console.log('Is this valid?', verificationResult);

    if (verificationResult.verified) {
      const gift = await this.getGift(id);

      console.log(`The gift of ID ${gift.id} has UUID of ${gift.uuid}`);

      try {
        const provider = new ethers.providers.JsonRpcProvider(
          process.env.NETWORK_RPC,
        );

        const privateKey = process.env.MARKET_PRIVATE_KEY;
        if (!privateKey) throw new Error('No private key.');
        const signer = new ethers.Wallet(privateKey, provider);

        const escrowContract = new ethers.Contract(
          process.env.PROXY_CONTRACT,
          ESCROW_ABI,
          signer,
        );

        await escrowContract.confirmFulfillment(gift.uuid);

        const currentBlock = await provider.getBlockNumber();

        const range = 1000;
        const fromBlock = Math.max(currentBlock - range, 0);
        const toBlock = currentBlock + range;

        const allEvents = await escrowContract.queryFilter(
          escrowContract.filters.FulfillmentConfirmed(),
          fromBlock,
          toBlock,
        );

        const filteredEvents = allEvents.filter(
          (event) => event.args.uuid === gift.uuid,
        );

        if (filteredEvents.length) {
          console.log(allEvents, 'Fulfilled by past event reference.');
          await this.giftRepo.update(id, { state: State.FULFILLED });
          await this.notificationService.sendNotification(
            gift.seller,
            gift.title,
          );
        } else {
          console.log('Waiting for the event to be emitted.');
          const result = new Promise((resolve, reject) => {
            escrowContract.once('FulfillmentConfirmed', async () => {
              try {
                console.log('Fulfilled!');
                await this.giftRepo.update(id, { state: State.FULFILLED });
                await this.notificationService.sendNotification(
                  gift.seller,
                  gift.title,
                );
                resolve({ success: true });
              } catch (error) {
                reject(error);
              }
            });
          });

          return result;
        }
      } catch (e) {
        throw e;
      }
    } else throw new UnauthorizedException('Not fulfilled.');
  }

  async confirm(id: number) {
    const gift = await this.getGift(id);

    if (gift.state === State.EXECUTED)
      throw new BadRequestException('Already executed.');

    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NETWORK_RPC,
    );
    const privateKey = process.env.MARKET_PRIVATE_KEY;
    if (!privateKey) throw new Error('No private key.');
    const signer = new ethers.Wallet(privateKey, provider);

    const escrowContract = new ethers.Contract(
      process.env.PROXY_CONTRACT,
      ESCROW_ABI,
      signer,
    );

    await escrowContract.confirmProductUsed(gift.uuid);

    const currentBlock = await provider.getBlockNumber();

    const range = 1000;
    const fromBlock = Math.max(currentBlock - range, 0);
    const toBlock = currentBlock + range;

    const allEvents = await escrowContract.queryFilter(
      escrowContract.filters.FundsDistributed(),
      fromBlock,
      toBlock,
    );

    const filteredEvents = allEvents.filter(
      (event) => event.args.uuid === gift.uuid,
    );

    if (filteredEvents.length) {
      console.log(allEvents, 'Fulfilled by past event reference.');
      await this.giftRepo.update(id, { state: State.EXECUTED });
    } else {
      console.log('Waiting for the event to be emitted.');
      escrowContract.once('FundsDistributed', async () => {
        console.log('Escrow Released!');
        await this.giftRepo.update(id, { state: State.EXECUTED });
      });
    }

    return { success: true };
  }
}
