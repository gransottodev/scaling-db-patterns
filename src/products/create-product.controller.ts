import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class CreateProductController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() productDto: CreateProductDto) {
    return await this.productsService.createProduct(productDto);
  }

  @Get()
  async getProducts() {
    return await this.productsService.findAll();
  }

  @Put('/stock')
  async updateStock(
    @Body('id') id: number,
    @Body('quantity') quantity: number,
  ) {
    return await this.productsService.updateStock(id, quantity);
  }
}
