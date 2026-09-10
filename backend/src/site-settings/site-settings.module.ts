import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettingsController } from './site-settings.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ObjectStorageService } from '../uploads/object-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService, RolesGuard, ObjectStorageService],
})
export class SiteSettingsModule {}
