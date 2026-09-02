import { Module } from '@nestjs/common';
import { VerificationModule } from './modules/verification/verification.module';
import { GateModule } from './modules/gate/gate.module';

@Module({
  imports: [VerificationModule, GateModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
