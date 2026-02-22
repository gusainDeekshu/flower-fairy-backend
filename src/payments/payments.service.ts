// Location: src/payments/payments.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; //
import { StripeService } from './providers/stripe.service';
import { RazorpayService } from './providers/razorpay.service';
import { PhonePeService } from './providers/phonepe.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private razorpayService: RazorpayService,
    private phonepeService: PhonePeService,
  ) {}

  async initiateCheckout(orderId: string, provider: 'STRIPE' | 'RAZORPAY' | 'PHONEPE', userId: string) {
    // Uses the 'order' model from your modular prisma/models/order.prisma
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    
    if (!order) throw new BadRequestException('Order not found');
    
    // Amount should be in smallest currency unit (paise/cents)
    const amount = order.totalAmount; 
    const currency = 'INR';

    switch (provider) {
      case 'STRIPE':
        return this.stripeService.createCheckout(order.id, amount, currency);
      case 'RAZORPAY':
        return this.razorpayService.createOrder(order.id, amount, currency);
      case 'PHONEPE':
        return this.phonepeService.createPayment(order.id, amount, userId);
      default:
        throw new BadRequestException('Invalid provider');
    }
  }

  async markOrderPaid(paymentId: string) {
    return await this.prisma.order.update({
      where: { paymentProviderId: paymentId },
      data: { status: 'PAID' }, //
    });
  }
}