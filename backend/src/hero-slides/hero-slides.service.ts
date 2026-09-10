import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ObjectStorageService } from '../uploads/object-storage.service';
import { CreateHeroSlideDto } from './dto/create-hero-slide.dto';
import { UpdateHeroSlideDto } from './dto/update-hero-slide.dto';

@Injectable()
export class HeroSlidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
  ) {}

  findAll() {
    return this.prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
  }

  async create(dto: CreateHeroSlideDto) {
    const order = await this.prisma.heroSlide.count();
    return this.prisma.heroSlide.create({ data: { ...dto, order } });
  }

  async update(id: string, dto: UpdateHeroSlideDto) {
    await this.requireExists(id);
    return this.prisma.heroSlide.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.requireExists(id);
    await this.prisma.heroSlide.delete({ where: { id } });

    // Close the gap left behind so `order` stays dense (0..n-1) — the
    // reorder endpoint below assumes exactly one id per position, and a
    // sparse sequence would make that assumption harder to reason about
    // for no benefit.
    const remaining = await this.prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });
    await this.prisma.$transaction(
      remaining.map((slide, index) =>
        this.prisma.heroSlide.update({
          where: { id: slide.id },
          data: { order: index },
        }),
      ),
    );
  }

  async reorder(orderedIds: string[]) {
    const existing = await this.prisma.heroSlide.findMany({
      select: { id: true },
    });
    const existingIds = new Set(existing.map((s) => s.id));
    const sameSet =
      orderedIds.length === existing.length &&
      orderedIds.every((id) => existingIds.has(id));
    if (!sameSet) {
      throw new BadRequestException(
        'orderedIds must contain exactly the current set of slide ids',
      );
    }

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.heroSlide.update({ where: { id }, data: { order: index } }),
      ),
    );

    return this.findAll();
  }

  uploadImage(file: Express.Multer.File): Promise<string> {
    return this.objectStorageService.uploadSiteAsset(file);
  }

  private async requireExists(id: string) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) {
      throw new NotFoundException(`Hero slide "${id}" not found`);
    }
  }
}
