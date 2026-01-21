import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all entities
import { User } from './entities/User';
import { Category } from './entities/Category';
import { Brand } from './entities/Brand';
import { Product } from './entities/Product';
import { ProductImage } from './entities/ProductImage';
import { Order } from './entities/Order';
import { OrderItem } from './entities/OrderItem';
import { Cart } from './entities/Cart';
import { CartItem } from './entities/CartItem';
import { Address } from './entities/Address';
import { Review } from './entities/Review';
import { Campaign } from './entities/Campaign';
import { FlashSale } from './entities/FlashSale';
import { FlashSaleProduct } from './entities/FlashSaleProduct';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecommerce_db',
  synchronize: !isProduction, // Auto-sync in development only
  logging: !isProduction,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Category,
    Brand,
    Product,
    ProductImage,
    Order,
    OrderItem,
    Cart,
    CartItem,
    Address,
    Review,
    Campaign,
    FlashSale,
    FlashSaleProduct,
  ],
  migrations: [],
  subscribers: [],
});
