import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';

@Injectable()
export class NotificationService {
  private wallet: ethers.Wallet;
  private provider: ethers.providers.JsonRpcProvider;
  private notifications: any[] = [];

  constructor(private configService: ConfigService) {
    this.provider = new ethers.providers.JsonRpcProvider(
      this.configService.get<string>('NETWORK_RPC'),
    );
    this.wallet = new ethers.Wallet(
      this.configService.get<string>('MARKET_PRIVATE_KEY'),
      this.provider,
    );
  }

  async sendNotification(recipients: string, giftTitle: string) {
    const market = await PushAPI.initialize(this.wallet, {
      env: CONSTANTS.ENV.STAGING,
    });
    try {
      const currentTimeStamp = Math.floor(Date.now() / 1000);
      const notificationResult = await market.channel.send([recipients], {
        notification: {
          title: 'Gift Used',
          body: `${giftTitle} has been used! Prepare your product! \n [timestamp: ${currentTimeStamp}]`,
        },
      });
      const parsedData = JSON.parse(notificationResult.config.data);
      const identityStr = parsedData.identity.substring(2);
      const parsedIdentity = JSON.parse(identityStr);

      const notificationData = {
        title: parsedIdentity.notification.title,
        body: parsedIdentity.notification.body,
        source: parsedData.source,
      };
      console.log('Push Notification has been sent:', notificationData);
      this.notifications.push(notificationData);
    } catch (error) {
      console.error('Push Notification failed:', error);
    }
  }

  getNotifications(): any[] {
    return this.notifications;
  }

  async signMessage(message: string): Promise<string> {
    const messageHash = ethers.utils.id(message);
    const flatSig = await this.wallet.signMessage(
      ethers.utils.arrayify(messageHash),
    );
    return flatSig;
  }
}
