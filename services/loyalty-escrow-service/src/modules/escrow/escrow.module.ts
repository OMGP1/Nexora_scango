import { Module } from '@nestjs/common';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { EscrowConsumer } from './escrow.consumer';

@Module({
  controllers: [EscrowController],
  providers: [EscrowService, EscrowConsumer],
})
export class EscrowModule {}
