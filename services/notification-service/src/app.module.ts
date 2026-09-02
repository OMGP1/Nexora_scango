import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    PrometheusModule.register(),NotificationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
