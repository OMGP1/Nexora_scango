import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ScaleService, ScaleReading } from './scale.service';

@Controller('api/v1/scale')
export class ScaleController {
  constructor(private readonly scaleService: ScaleService) {}

  @Get(':storeId/:laneCode/latest')
  async getLatestReading(
    @Param('storeId') storeId: string,
    @Param('laneCode') laneCode: string,
  ): Promise<ScaleReading> {
    const reading = await this.scaleService.getLatestReading(storeId, laneCode);
    if (!reading) {
      throw new NotFoundException(`No latest reading found for store ${storeId} and lane ${laneCode}`);
    }
    return reading;
  }
}
