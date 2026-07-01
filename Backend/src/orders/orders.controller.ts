import { Body, Controller, Param, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** Step 1 — create a PayPal order and save a pending order row */
  @Post()
  createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createPayPalOrder(dto);
  }

  /** Step 2 — capture the payment after user approves on PayPal */
  @Post(':paypalOrderId/capture')
  captureOrder(@Param('paypalOrderId') paypalOrderId: string) {
    return this.ordersService.capturePayPalOrder(paypalOrderId);
  }
}
