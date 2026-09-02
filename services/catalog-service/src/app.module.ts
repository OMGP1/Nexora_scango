import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    PrometheusModule.register(),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://scango:scango_dev_pass@localhost:27017/scango_catalog?authSource=admin'),
    ProductModule,
    CategoryModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
