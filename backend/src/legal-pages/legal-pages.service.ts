import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LegalPageResponseDto } from './dto/legal-page-response.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';

@Injectable()
export class LegalPagesService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponseDto(page: {
    slug: string;
    title: string;
    sections: unknown;
    updatedAt: Date;
  }): LegalPageResponseDto {
    return {
      slug: page.slug,
      title: page.title,
      sections: page.sections as LegalPageResponseDto['sections'],
      updatedAt: page.updatedAt,
    };
  }

  async findBySlug(slug: string): Promise<LegalPageResponseDto> {
    const page = await this.prisma.legalPage.findUnique({ where: { slug } });
    if (!page) {
      throw new NotFoundException(`Legal page "${slug}" not found`);
    }
    return this.toResponseDto(page);
  }

  async update(
    slug: string,
    dto: UpdateLegalPageDto,
  ): Promise<LegalPageResponseDto> {
    const existing = await this.prisma.legalPage.findUnique({
      where: { slug },
    });
    if (!existing) {
      throw new NotFoundException(`Legal page "${slug}" not found`);
    }

    const updated = await this.prisma.legalPage.update({
      where: { slug },
      data: {
        title: dto.title,
        sections: dto.sections.map((section) => ({
          title: section.title,
          body: section.body,
        })),
      },
    });

    return this.toResponseDto(updated);
  }
}
