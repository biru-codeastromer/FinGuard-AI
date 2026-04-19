import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  accountId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  currency!: string;

  @IsIn(['DEBIT', 'CREDIT'])
  transactionType!: 'DEBIT' | 'CREDIT';

  @IsOptional()
  @IsString()
  merchantName?: string;

  @IsOptional()
  @IsString()
  merchantCategory?: string;

  @IsOptional()
  @IsString()
  geoLocation?: string;

  @IsOptional()
  @IsString()
  sourceIp?: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @IsString()
  idempotencyKey!: string;
}
