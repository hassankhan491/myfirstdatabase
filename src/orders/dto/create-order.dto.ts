import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @IsString()
  @IsOptional()
  status?: string; // Defaults to PENDING

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsNotEmpty()
  storeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}