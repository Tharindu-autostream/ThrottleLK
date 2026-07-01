import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';

const SHIPPING_FEE = 450;

interface PayPalTokenResponse {
  access_token: string;
}

interface PayPalOrderResponse {
  id: string;
}

interface PayPalCaptureResponse {
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{ id: string }>;
    };
  }>;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly config: ConfigService,
  ) {}

  private get paypalBaseUrl(): string {
    return this.config.get<string>('PAYPAL_MODE', 'sandbox') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.config.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'PayPal credentials are not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.',
      );
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(`${this.paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      throw new InternalServerErrorException('Failed to obtain PayPal access token');
    }

    const data = (await res.json()) as PayPalTokenResponse;
    return data.access_token;
  }

  private effectivePrice(item: { price: number; discountPercent?: number }): number {
    return item.discountPercent && item.discountPercent > 0
      ? Math.round(item.price * (1 - item.discountPercent / 100))
      : item.price;
  }

  /**
   * Persist an order placed through the WhatsApp / bank-transfer flow.
   * No payment gateway is involved, so it is saved as a pending order that
   * the admin can review and mark paid once the deposit slip arrives.
   */
  async createManualOrder(dto: CreateOrderDto): Promise<{ orderId: string }> {
    const subtotal = dto.items.reduce(
      (sum, item) => sum + this.effectivePrice(item) * item.quantity,
      0,
    );
    const total = subtotal + SHIPPING_FEE;

    const order = this.orderRepo.create({
      billing: dto.billing,
      items: dto.items,
      subtotal,
      shippingFee: SHIPPING_FEE,
      total,
      paymentMethod: 'whatsapp',
      status: 'pending',
    });
    await this.orderRepo.save(order);

    return { orderId: order.id };
  }

  /** List every order, newest first — used by the admin dashboard. */
  findAll(): Promise<Order[]> {
    return this.orderRepo.find({ order: { createdAt: 'DESC' } });
  }

  /** Update the fulfilment status of an order. */
  async updateStatus(id: string, status: string): Promise<Order> {
    const allowed = ['pending', 'paid', 'failed', 'cancelled'];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    order.status = status;
    return this.orderRepo.save(order);
  }

  /**
   * Convert a LKR amount to USD using the configured rate.
   * LKR_PER_USD env var (default 320) sets how many LKR equal 1 USD.
   */
  private lkrToUsd(lkr: number): number {
    const rate = Number(this.config.get<string>('LKR_PER_USD', '320'));
    return Math.ceil((lkr / rate) * 100) / 100; // round up to nearest cent
  }

  async createPayPalOrder(
    dto: CreateOrderDto,
  ): Promise<{ orderId: string; paypalOrderId: string }> {
    const subtotal = dto.items.reduce(
      (sum, item) => sum + this.effectivePrice(item) * item.quantity,
      0,
    );
    const total = subtotal + SHIPPING_FEE;

    // PayPal does not support LKR — charge in USD
    const usdSubtotal = this.lkrToUsd(subtotal);
    const usdShipping = this.lkrToUsd(SHIPPING_FEE);
    const usdTotal = this.lkrToUsd(total);
    const PAYPAL_CURRENCY = 'USD';

    const token = await this.getAccessToken();

    const res = await fetch(`${this.paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: `Throttle LK order — LKR ${total.toLocaleString()} (≈ USD ${usdTotal.toFixed(2)})`,
            amount: {
              currency_code: PAYPAL_CURRENCY,
              value: usdTotal.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: PAYPAL_CURRENCY,
                  value: usdSubtotal.toFixed(2),
                },
                shipping: {
                  currency_code: PAYPAL_CURRENCY,
                  value: usdShipping.toFixed(2),
                },
              },
            },
            items: dto.items.map((item) => ({
              name: item.name.substring(0, 127),
              unit_amount: {
                currency_code: PAYPAL_CURRENCY,
                value: this.lkrToUsd(this.effectivePrice(item)).toFixed(2),
              },
              quantity: String(item.quantity),
            })),
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new InternalServerErrorException(
        `PayPal order creation failed: ${errText}`,
      );
    }

    const paypalData = (await res.json()) as PayPalOrderResponse;

    const order = this.orderRepo.create({
      billing: dto.billing,
      items: dto.items,
      subtotal,
      shippingFee: SHIPPING_FEE,
      total,
      paypalTotal: usdTotal,
      paypalCurrency: PAYPAL_CURRENCY,
      paypalOrderId: paypalData.id,
      status: 'pending',
    });
    await this.orderRepo.save(order);

    return { orderId: order.id, paypalOrderId: paypalData.id };
  }

  async capturePayPalOrder(
    paypalOrderId: string,
  ): Promise<{ success: boolean; orderId: string }> {
    const token = await this.getAccessToken();

    const res = await fetch(
      `${this.paypalBaseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new BadRequestException(`PayPal capture failed: ${errText}`);
    }

    const captureData = (await res.json()) as PayPalCaptureResponse;
    const captureId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

    const order = await this.orderRepo.findOne({ where: { paypalOrderId } });
    if (order) {
      order.status = captureData.status === 'COMPLETED' ? 'paid' : 'failed';
      order.paypalCaptureId = captureId;
      await this.orderRepo.save(order);
    }

    return {
      success: captureData.status === 'COMPLETED',
      orderId: order?.id ?? '',
    };
  }
}
