import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../uploads/object-storage.service';
import { SiteSettingsResponseDto } from './dto/site-settings-response.dto';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class SiteSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  private toResponseDto(settings: {
    siteName: string;
    logoUrl: string | null;
    announcementText: string | null;
    updatedAt: Date;
  }): SiteSettingsResponseDto {
    return {
      siteName: settings.siteName,
      logoUrl: settings.logoUrl,
      announcementText: settings.announcementText,
      updatedAt: settings.updatedAt,
    };
  }

  async get(): Promise<SiteSettingsResponseDto> {
    const settings = await this.prisma.siteSettings.findUnique({
      where: { id: SINGLETON_ID },
    });
    if (!settings) {
      throw new NotFoundException('Site settings have not been seeded');
    }
    return this.toResponseDto(settings);
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponseDto> {
    const existing = await this.prisma.siteSettings.findUnique({
      where: { id: SINGLETON_ID },
    });
    if (!existing) {
      throw new NotFoundException('Site settings have not been seeded');
    }

    const updated = await this.prisma.siteSettings.update({
      where: { id: SINGLETON_ID },
      data: {
        siteName: dto.siteName,
        logoUrl: dto.logoUrl,
        announcementText: dto.announcementText,
      },
    });

    return this.toResponseDto(updated);
  }

  uploadLogo(file: Express.Multer.File): Promise<string> {
    return this.objectStorageService.uploadSiteAsset(file);
  }
}
