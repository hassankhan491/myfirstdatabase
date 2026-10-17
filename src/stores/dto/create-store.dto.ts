import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['AMAZON', 'WALMART'])
  @IsNotEmpty()
  marketplace: 'AMAZON' | 'WALMART';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsNotEmpty()
  clientId: string;
}