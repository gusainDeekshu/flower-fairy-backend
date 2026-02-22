// Location: src/payments/providers/razorpay.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RazorpayService {
  private razorpay: any;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(orderId: string, amount: number, currency: string) {
    const options = {
      amount, // Amount in paise
      currency,
      receipt: orderId,
    };

    const order = await this.razorpay.orders.create(options);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentProviderId: order.id, paymentProvider: 'RAZORPAY' },
    });

    return { 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID // Needed by frontend to initialize SDK
    };
  }

  verifySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      throw new BadRequestException('Invalid Razorpay signature');
    }
    return true;
  }
}