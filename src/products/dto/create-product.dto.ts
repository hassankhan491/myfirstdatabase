import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  masterSku: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;
}