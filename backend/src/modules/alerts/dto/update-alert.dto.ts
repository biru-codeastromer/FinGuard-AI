import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAlertDto {
  @IsIn(['OPEN', 'IN_REVIEW', 'RESOLVED'])
  status!: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';

  @IsOptional()
  @IsString()
  actionNote?: string;
}
