import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FlashSale } from './FlashSale';
import { Product } from './Product';

@Entity('flash_sale_products')
export class FlashSaleProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  flash_sale_id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  flash_price: number;

  @Column({ type: 'int' })
  flash_stock: number;

  @Column({ type: 'int', default: 0 })
  sold_count: number;

  @Column({ type: 'boolean', default: false })
  is_delete: boolean;

  // Relations
  @ManyToOne(() => FlashSale, (flashSale) => flashSale.flash_sale_products)
  @JoinColumn({ name: 'flash_sale_id' })
  flash_sale: FlashSale;

  @ManyToOne(() => Product, (product) => product.flash_sale_products)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
