import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './Product';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'varchar', length: 500 })
  image_url: string;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'boolean', default: false })
  is_delete: boolean;

  // Relations
  @ManyToOne(() => Product, (product) => product.product_images)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
