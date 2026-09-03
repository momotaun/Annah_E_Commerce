import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Shape of PayFast's ITN (webhook) POST — field names are exactly what
 * PayFast sends (snake_case), so they don't follow our usual camelCase
 * convention. payment_status is a free string (COMPLETE/CANCELLED are the
 * documented values) rather than a fixed enum for the same defensive reason
 * as Ozow's Status: mapped in PaymentsService rather than rejected here if
 * PayFast sends a value this DTO doesn't know about yet.
 */
export class PayfastWebhookDto {
  @IsString()
  @IsNotEmpty()
  m_payment_id: string;

  @IsString()
  @IsNotEmpty()
  pf_payment_id: string;

  @IsString()
  @IsNotEmpty()
  payment_status: string;

  @IsString()
  @IsNotEmpty()
  item_name: string;

  @IsOptional()
  @IsString()
  item_description?: string;

  @IsString()
  @IsNotEmpty()
  amount_gross: string;

  @IsOptional()
  @IsString()
  amount_fee?: string;

  @IsOptional()
  @IsString()
  amount_net?: string;

  @IsOptional()
  @IsString()
  custom_str1?: string;

  @IsOptional()
  @IsString()
  custom_str2?: string;

  @IsOptional()
  @IsString()
  custom_str3?: string;

  @IsOptional()
  @IsString()
  custom_str4?: string;

  @IsOptional()
  @IsString()
  custom_str5?: string;

  @IsOptional()
  @IsString()
  custom_int1?: string;

  @IsOptional()
  @IsString()
  custom_int2?: string;

  @IsOptional()
  @IsString()
  custom_int3?: string;

  @IsOptional()
  @IsString()
  custom_int4?: string;

  @IsOptional()
  @IsString()
  custom_int5?: string;

  @IsOptional()
  @IsString()
  name_first?: string;

  @IsOptional()
  @IsString()
  name_last?: string;

  @IsOptional()
  @IsString()
  email_address?: string;

  @IsString()
  @IsNotEmpty()
  merchant_id: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
