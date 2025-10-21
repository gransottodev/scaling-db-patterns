import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
          ttl: configService.get<number>('CACHE_TTL', 300) * 1000,
        });
        return { store };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        replication: {
          master: {
            host: configService.get<string>('DB_MASTER_HOST'),
            port: configService.get<number>('DB_MASTER_PORT'),
            username: configService.get<string>('DB_MASTER_USER'),
            password: configService.get<string>('DB_MASTER_PASS'),
            database: configService.get<string>('DB_NAME'),
          },
          slaves: [
            {
              host: configService.get<string>('DB_SLAVE_HOST'),
              port: configService.get<number>('DB_SLAVE_PORT'),
              username: configService.get<string>('DB_SLAVE_USER'),
              password: configService.get<string>('DB_SLAVE_PASS'),
              database: configService.get<string>('DB_NAME'),
            },
          ],
        },
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
  ],
})
export class AppModule {}
