import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    PrometheusModule.register(),DbModule, AuthModule, CustomerModule, UserModule, RoleModule, StoreModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
