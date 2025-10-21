import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Product } from '../../products/product.entity';

export async function seedProducts(dataSource: DataSource): Promise<void> {
  const productRepository = dataSource.getRepository(Product);

  // Verifica quantos produtos já existem
  const existingCount = await productRepository.count();
  console.log(`📊 Current products in database: ${existingCount}`);

  if (existingCount >= 5) {
    console.log('✅ Database already has 5 or more products. Skipping seed...');
    return;
  }

  const productsToCreate = 5 - existingCount;
  console.log(`🌱 Seeding ${productsToCreate} products...\n`);

  const products: Partial<Product>[] = [];

  for (let i = 0; i < productsToCreate; i++) {
    const productData = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
      stock: faker.number.int({ min: 0, max: 200 }),
    };
    products.push(productData);
    console.log(
      `   📦 ${i + 1}. ${productData.name} - $${productData.price} (Stock: ${productData.stock})`,
    );
  }

  const savedProducts = await productRepository.save(products);

  console.log(`\n✅ Successfully seeded ${savedProducts.length} products!`);
  console.log(
    `📊 Total products in database: ${existingCount + savedProducts.length}`,
  );
}
