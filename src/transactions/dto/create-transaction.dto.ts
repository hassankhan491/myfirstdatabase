import { IsNotEmpty, IsNumber, IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateTransactionDto {
  @IsIn(['SALE', 'REFUND', 'FEE', 'AGENCY_FEE', 'PURCHASE'])
  @IsNotEmpty()
  type: 'SALE' | 'REFUND' | 'FEE' | 'AGENCY_FEE' | 'PURCHASE';

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  orderId?: string;
}