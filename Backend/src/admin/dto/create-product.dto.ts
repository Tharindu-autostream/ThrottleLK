import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  @MaxLength(128)
  category: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  colors: string[];

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specifications?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;

  /** Discount percentage 1–99. Omit or send 0 to remove the discount. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  discountPercent?: number;
}
