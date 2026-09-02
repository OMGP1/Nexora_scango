import { Controller, Post, Body } from '@nestjs/common';
import { GateService } from './gate.service';

@Controller('api/v1/gate')
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @Post('scan')
  async scanExitPass(@Body('token') token: string) {
    return this.gateService.scanExitPass(token);
  }
}
