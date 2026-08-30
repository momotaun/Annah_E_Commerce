import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Shape of Ozow's Notify (webhook) POST — field names are exactly what
 * Ozow sends, so they stay PascalCase rather than following our usual
 * camelCase convention. Status is a free string (not a fixed enum) because
 * Ozow's known values (Complete, Cancelled, Error, Abandoned,
 * PendingInvestigation) are mapped defensively in PaymentsService rather
 * than rejected at the validation layer if Ozow adds a new one.
 */
export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  SiteCode: string;

  @IsString()
  @IsNotEmpty()
  TransactionId: string;

  @IsString()
  @IsNotEmpty()
  TransactionReference: string;

  @IsString()
  @IsNotEmpty()
  Amount: string;

  @IsString()
  @IsNotEmpty()
  Status: string;

  @IsOptional()
  @IsString()
  Optional1?: string;

  @IsOptional()
  @IsString()
  Optional2?: string;

  @IsOptional()
  @IsString()
  Optional3?: string;

  @IsOptional()
  @IsString()
  Optional4?: string;

  @IsOptional()
  @IsString()
  Optional5?: string;

  @IsString()
  @IsNotEmpty()
  CurrencyCode: string;

  @IsString()
  @IsNotEmpty()
  IsTest: string;

  @IsOptional()
  @IsString()
  StatusMessage?: string;

  @IsString()
  @IsNotEmpty()
  Hash: string;
}
