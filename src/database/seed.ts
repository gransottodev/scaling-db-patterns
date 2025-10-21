import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { createClient } from 'redis';
import { Product } from '../products/product.entity';
import { seedProducts } from './seeds/product.seed';

// Carrega variáveis de ambiente
config();

const configService = new ConfigService();

// Função para invalidar o cache
async function invalidateCache(): Promise<void> {
  const redisClient = createClient({
    socket: {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
    },
  });

  try {
    await redisClient.connect();
    console.log('🔄 Connecting to Redis...');

    // Deleta a chave do cache de produtos
    const deleted = await redisClient.del('products:all');

    if (deleted > 0) {
      console.log('✅ Cache invalidated successfully!');
    } else {
      console.log('ℹ️  No cache found to invalidate');
    }

    await redisClient.disconnect();
  } catch (error) {
    console.warn('⚠️  Could not connect to Redis:', error.message);
    console.log('ℹ️  Continuing without cache invalidation...');
  }
}

// Configuração do DataSource para seeds
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_MASTER_HOST'),
  port: configService.get<number>('DB_MASTER_PORT'),
  username: configService.get<string>('DB_MASTER_USER'),
  password: configService.get<string>('DB_MASTER_PASS'),
  database: configService.get<string>('DB_NAME'),
  entities: [Product],
  synchronize: false,
});

async function runSeed() {
  console.log('🚀 Starting database seed...\n');

  try {
    // Inicializa a conexão
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Executa o seed de produtos
    await seedProducts(AppDataSource);

    // Invalida o cache após o seed
    await invalidateCache();

    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  } finally {
    // Fecha a conexão
    await AppDataSource.destroy();
    console.log('\n👋 Database connection closed');
  }
}

void runSeed();
