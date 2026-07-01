import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Order } from '../orders/order.entity';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
