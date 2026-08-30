import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LegalPagesService } from './legal-pages.service';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';

@Controller('legal-pages')
export class LegalPagesController {
  constructor(private readonly legalPagesService: LegalPagesService) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.legalPagesService.findBySlug(slug);
  }

  @Patch(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('slug') slug: string, @Body() dto: UpdateLegalPageDto) {
    return this.legalPagesService.update(slug, dto);
  }
}
