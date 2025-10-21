import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';
import { CreateProductController } from './create-product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [CreateProductController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
