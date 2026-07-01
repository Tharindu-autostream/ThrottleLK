import { IsIn, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['pending', 'paid', 'failed', 'cancelled'])
  status: string;
}
