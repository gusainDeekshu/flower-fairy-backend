// Location: src/payments/providers/stripe.service.ts

import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2026-01-28.clover' as any });  }

  async createCheckout(orderId: string, amount: number, currency: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: { 
          currency, 
          product_data: { name: `Order #${orderId.substring(0, 8)}` }, 
          unit_amount: amount // Stripe expects smallest currency unit (cents/paise)
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/success?order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/checkout/cancel`,
      client_reference_id: orderId,
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentProviderId: session.id, paymentProvider: 'STRIPE' },
    });

    return { url: session.url };
  }

  verifyWebhook(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  }
}