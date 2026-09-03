import { Controller, Post, Body } from '@nestjs/common';
import { EscrowService } from './escrow.service';

export class InitDto {
  sessionId: string;
  userId: string;
}

export class ResolveDto {
  sessionId: string;
  outcome: string;
}

@Controller('api/v1/escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('init')
  async initSession(@Body() body: InitDto) {
    const result = await this.escrowService.initSession(body.sessionId, body.userId);
    return { success: true, data: result };
  }

  @Post('resolve')
  async resolveEscrow(@Body() body: ResolveDto) {
    const result = await this.escrowService.resolveEscrow(body.sessionId, body.outcome);
    return { success: true, data: result };
  }
}
