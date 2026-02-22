// Location: src/payments/providers/phonepe.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PhonePeService {
  private readonly baseUrl = process.env.PHONEPE_ENV === 'PROD' 
    ? 'https://api.phonepe.com/apis/hermes' 
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  constructor(private prisma: PrismaService, private httpService: HttpService) {}

  async createPayment(orderId: string, amount: number, userId: string) {
    const transactionId = `TXN_${orderId.replace(/-/g, '')}`; // PhonePe prefers alphanumeric
    
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: amount, // in paise
      redirectUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/phonepe/callback`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/phonepe/webhook`,
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = this.generateChecksum(base64Payload, '/pg/v1/pay');

    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/pg/v1/pay`, { request: base64Payload }, {
        headers: { 
          'X-VERIFY': checksum, 
          'Content-Type': 'application/json' 
        },
      })
    );

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentProviderId: transactionId, paymentProvider: 'PHONEPE' },
    });

    return { url: response.data.data.instrumentResponse.redirectInfo.url };
  }

  private generateChecksum(base64Payload: string, endpoint: string) {
    const stringToHash = base64Payload + endpoint + process.env.PHONEPE_SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    return `${sha256}###${process.env.PHONEPE_SALT_INDEX}`;
  }

  verifyChecksum(responseBase64: string, providedChecksum: string) {
    const calculatedChecksum = this.generateChecksum(responseBase64, ''); 
    if (calculatedChecksum !== providedChecksum) {
      throw new BadRequestException('Invalid PhonePe Checksum');
    }
    return true;
  }
}