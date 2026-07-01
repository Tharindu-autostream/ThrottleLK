import { Controller, Get } from '@nestjs/common';
import type { SiteContentResponse } from './site-content.types';
import { SiteContentService } from './site-content.service';

@Controller('site')
export class SiteContentController {
  constructor(private readonly siteContent: SiteContentService) {}

  @Get('content')
  getContent(): Promise<SiteContentResponse> {
    return this.siteContent.getPublicContent();
  }
}
