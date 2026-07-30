import { IsIn } from 'class-validator';

export class ApproveVendorDto {
  @IsIn(['APPROVED', 'SUSPENDED'])
  status: 'APPROVED' | 'SUSPENDED';
}
