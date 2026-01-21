import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductBadge } from '../enums';
import { Category } from './Category';
import { Brand } from './Brand';
import type { OrderItem } from './OrderItem';
import type { CartItem } from './CartItem';
import type { Review } from './Review';
import type { FlashSaleProduct } from './FlashSaleProduct';
import type { ProductImage } from './ProductImage';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  original_price: number;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'uuid', nullable: true })
  brand_id: string;

  @Column({ type: 'int', default: 0 })
  stock_quantity: number;

  @Column({
    type: 'enum',
    enum: ProductBadge,
    default: ProductBadge.NONE,
  })
  badge: ProductBadge;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_delete: boolean;

  // Relations
  @ManyToOne(() => Category, (category) => category.products, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @OneToMany('OrderItem', 'product')
  order_items: OrderItem[];

  @OneToMany('CartItem', 'product')
  cart_items: CartItem[];

  @OneToMany('Review', 'product')
  reviews: Review[];

  @OneToMany('FlashSaleProduct', 'product')
  flash_sale_products: FlashSaleProduct[];

  @OneToMany('ProductImage', 'product')
  product_images: ProductImage[];
}
