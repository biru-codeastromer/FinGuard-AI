import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRuleDto {
  @IsString()
  ruleName!: string;

  @IsString()
  ruleType!: string;

  @IsInt()
  @Min(1)
  priority!: number;

  @IsIn(['APPROVE', 'HOLD', 'BLOCK'])
  action!: 'APPROVE' | 'HOLD' | 'BLOCK';

  @IsObject()
  conditionJson!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
