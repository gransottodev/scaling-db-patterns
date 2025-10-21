import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Product } from './product.entity';
import { CreateProductDto } from './dtos/create-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_KEY = 'products:all';
  private readonly CACHE_TTL = 300000;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    this.logger.debug(
      'Creating a new product: ' + JSON.stringify(createProductDto),
    );

    const product = this.productRepository.create(createProductDto);
    const savedProduct = await this.productRepository.save(product);

    await this.invalidateCache();
    this.logger.debug('Cache invalidated after creating product');

    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    const cachedProducts = await this.cacheManager.get<Product[]>(
      this.CACHE_KEY,
    );

    if (cachedProducts) {
      this.logger.debug('Products found in cache (Cache Hit)');
      return cachedProducts;
    }

    this.logger.debug(
      'Products not found in cache (Cache Miss), fetching from database',
    );

    const products = await this.productRepository.find({
      order: {
        createdAt: 'ASC',
      },
    });

    await this.cacheManager.set(this.CACHE_KEY, products, this.CACHE_TTL);
    this.logger.debug('Products cached successfully');

    return products;
  }

  private async invalidateCache(): Promise<void> {
    await this.cacheManager.del(this.CACHE_KEY);
  }

  async findOne(id: number): Promise<Product | null> {
    this.logger.debug(`Fetching product with id: ${id}`);

    return await this.productRepository.findOne({
      where: { id },
    });
  }

  async updateStock(id: number, quantity: number): Promise<Product | null> {
    const product = await this.findOne(id);

    if (!product) {
      return null;
    }

    product.stock = quantity;

    return await this.productRepository.save(product);
  }
}
