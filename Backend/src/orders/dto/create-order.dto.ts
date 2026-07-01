import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class BillingDto {
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsOptional() @IsString() company?: string;
  @IsString() @IsNotEmpty() district: string;
  @IsString() @IsNotEmpty() street: string;
  @IsOptional() @IsString() apartment?: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() postcode: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() notes?: string;
}

class OrderItemDto {
  @IsString() @IsNotEmpty() id: string;
  @IsString() @IsNotEmpty() name: string;
  @IsNumber() price: number;
  @IsOptional() @IsNumber() discountPercent?: number;
  @IsNumber() quantity: number;
  @IsString() selectedColor: string;
  @IsString() category: string;
  @IsString() image: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => BillingDto)
  billing: BillingDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
