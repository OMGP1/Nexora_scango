import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { SmsAdapter } from '../../adapters/sms.adapter';
import { PushAdapter } from '../../adapters/push.adapter';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    SmsAdapter,
    PushAdapter
  ],
})
export class NotificationModule {}
