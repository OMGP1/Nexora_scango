import { Module } from '@nestjs/common';
import { ScaleService } from './scale.service';
import { ScaleController } from './scale.controller';
import { ScaleMqttSubscriber } from './scale-mqtt.subscriber';

@Module({
  controllers: [ScaleController],
  providers: [ScaleService, ScaleMqttSubscriber],
})
export class ScaleModule {}
