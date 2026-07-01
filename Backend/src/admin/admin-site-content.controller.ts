import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import type { SiteContentResponse } from '../site/site-content.types';
import { SiteContentService } from '../site/site-content.service';
import { UpdateSiteContentDto } from './dto/update-site-content.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('admin/site')
@UseGuards(JwtAuthGuard)
export class AdminSiteContentController {
  constructor(private readonly siteContent: SiteContentService) {}

  @Get('content')
  getContent(): Promise<SiteContentResponse> {
    return this.siteContent.getPublicContent();
  }

  @Put('content')
  update(@Body() dto: UpdateSiteContentDto): Promise<SiteContentResponse> {
    return this.siteContent.update(dto);
  }
}
