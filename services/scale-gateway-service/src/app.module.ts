import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ScaleModule } from './modules/scale/scale.module';

@Module({
  imports: [ScaleModule],
  controllers: [HealthController],
})
export class AppModule {}
