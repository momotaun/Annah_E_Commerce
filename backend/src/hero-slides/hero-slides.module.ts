import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HeroSlidesService } from './hero-slides.service';
import { HeroSlidesController } from './hero-slides.controller';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ObjectStorageService } from '../uploads/object-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [HeroSlidesController],
  providers: [HeroSlidesService, RolesGuard, ObjectStorageService],
})
export class HeroSlidesModule {}
