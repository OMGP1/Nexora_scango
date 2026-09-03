import { Controller, Post, Get, Delete, Param, Body, Headers, Query } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('api/v1/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(
    @Body('store_id') storeId: string,
    @Body('device_fingerprint') deviceFingerprint: string,
    @Headers('x-user-id') customerId: string,
    @Headers('x-user-role') role: string
  ) {
    const type = role ? 'loyalty' : 'guest';
    return this.sessionService.createSession(storeId, customerId || null, type, deviceFingerprint);
  }

  @Get()
  async getSessions(
    @Query('store_id') storeId: string,
    @Query('verification_status') verificationStatus: string
  ) {
    if (!storeId) storeId = 'STORE_001';
    const data = await this.sessionService.listSessions(storeId, verificationStatus);
    return { success: true, data };
  }

  @Get(':id')
  async getSession(@Param('id') id: string) {
    return this.sessionService.getSession(id);
  }

  @Post(':id/pause')
  async pauseSession(@Param('id') id: string) {
    return this.sessionService.pauseSession(id);
  }

  @Post(':id/resume')
  async resumeSession(@Param('id') id: string) {
    return this.sessionService.resumeSession(id);
  }

  @Delete(':id')
  async abandonSession(@Param('id') id: string) {
    return this.sessionService.abandonSession(id);
  }

  @Post('join')
  async joinSession(
    @Body('join_code') joinCode: string,
    @Body('device_fingerprint') deviceFingerprint: string
  ) {
    return this.sessionService.joinSession(joinCode, deviceFingerprint);
  }
}
