import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @IsString()
  @IsNotEmpty()
  productId: string;
}