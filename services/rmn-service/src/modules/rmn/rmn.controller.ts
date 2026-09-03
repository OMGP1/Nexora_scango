import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { RmnService } from './rmn.service';

@Controller('rmn')
export class RmnController {
  constructor(private readonly rmnService: RmnService) {}

  @Get('ads')
  async getAds(
    @Query('sku') sku?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.rmnService.getAds(sku, categoryId);
  }

  @Post('impressions')
  async logImpression(@Body() body: { adId: string; sessionId: string }) {
    return this.rmnService.logImpression(body.adId, body.sessionId);
  }
}
