import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LegalPagesService } from './legal-pages.service';
import { LegalPagesController } from './legal-pages.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [AuthModule],
  controllers: [LegalPagesController],
  providers: [LegalPagesService, RolesGuard],
})
export class LegalPagesModule {}
