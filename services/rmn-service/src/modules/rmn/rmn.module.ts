import { Module } from '@nestjs/common';
import { RmnController } from './rmn.controller';
import { RmnService } from './rmn.service';
import { RmnConsumer } from './rmn.consumer';

@Module({
  controllers: [RmnController],
  providers: [RmnService, RmnConsumer],
})
export class RmnModule {}
