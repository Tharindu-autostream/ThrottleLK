import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(128)
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  /** Top-level parent id; omit or null for a root category */
  @IsOptional()
  @IsUUID('4')
  parentId?: string | null;
}
