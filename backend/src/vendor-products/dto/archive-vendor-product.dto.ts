import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ArchiveReason } from '@prisma/client';

export class ArchiveVendorProductDto {
  @IsEnum(ArchiveReason)
  reason: ArchiveReason;

  @IsOptional()
  @IsString()
  description?: string;
}
