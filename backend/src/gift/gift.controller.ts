import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GiftService } from './gift.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ReqReceiveGift } from './dto/req-receive-gift.dto';
import { ReqUseGift } from './dto/req-use-gift.dto';
import { ReqConfirmGift } from './dto/req-confirm-gift.dto';
import { ResGetState } from './dto/res-get-state.dto';
import { badRequest } from 'src/common/error/bad-request';
import { plainToInstance } from 'class-transformer';
import { ResGetGifts } from './dto/res-get-gifts.dto';
import { Order } from 'src/common/enum/order.enum';
import { VerifiableCredential } from '@veramo/core';
import { QueryCredentialsRequestResult } from '@blockchain-lab-um/masca-connector';
import { State } from 'src/common/enum/state.enum';

@ApiTags('Gift')
@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  @Get()
  @ApiOperation({ summary: 'Gift List' })
  @ApiOkResponse({ type: ResGetGifts })
  @ApiQuery({ name: 'buyer', required: false, type: String })
  @ApiQuery({ name: 'receiver', required: false, type: String })
  async getGifts(
    @Query('buyer') buyer: string,
    @Query('receiver') receiver: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('order', new ParseEnumPipe(Order)) order: Order,
  ): Promise<ResGetGifts> {
    const result = await this.giftService.getGifts(
      buyer,
      receiver,
      page,
      order,
    );
    return plainToInstance(ResGetGifts, result);
  }

  @Get(':id/state')
  @ApiOperation({ summary: 'Gift State' })
  @ApiOkResponse({ type: ResGetState })
  @ApiBadRequestResponse(badRequest('Required escrow contract address.'))
  async getState(@Param('id', ParseIntPipe) id: number): Promise<ResGetState> {
    const result = await this.giftService.getState(id);
    return plainToInstance(ResGetState, result);
  }

  @Patch(':id/receive')
  @ApiOperation({ summary: 'Receive Gift' })
  async receiveGift(
    @Param('id', ParseIntPipe) id: number,
    @Body() reqReceiveGift: ReqReceiveGift,
  ) {
    return this.giftService.receiveGift(id, reqReceiveGift);
  }

  @Post(':id/issue')
  @ApiOperation({
    summary: 'Update Gift State to ISSUED if the credential is saved',
  })
  async issueVC(
    @Param('id', ParseIntPipe) id: number,
    @Body() saveResponse: { success: boolean },
  ) {
    return this.giftService.checkSavedCredential(id, saveResponse);
  }

  @Patch(':id/use')
  @ApiOperation({ summary: 'Use Gift' })
  async useGift(
    @Param('id', ParseIntPipe) id: number,
    // @Body() reqUseGift: ReqUseGift,
    @Body() VcRes: QueryCredentialsRequestResult,
  ) {
    return this.giftService.verifyCredential(id, VcRes);
  }

  @Patch(':id/confirm')
  @ApiOperation({
    summary: 'Confirm Receipt',
  })
  async confirmGift(
    @Param('id', ParseIntPipe) id: number,
    // @Body() reqConfirmGift: ReqConfirmGift,
  ) {
    return this.giftService.confirm(id);
  }

  @Get(':id/credentialStatus')
  @ApiOperation({ summary: 'Check Revocation Status' })
  async checkCredentialStatus(@Param('id', ParseIntPipe) id: number) {
    const current = await this.giftService.getState(id);
    if (current.state === State.EXECUTED) return true;
    else return false;
  }
}
