import { IsIn } from 'class-validator';

export class ResolveReturnRequestDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
}
