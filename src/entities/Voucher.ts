import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from './Brand';
import { Category } from './Category';
import { Product } from './Product';

export enum VoucherStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

export enum VoucherDiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

export enum VoucherScopeType {
  ALL = 'all',
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand',
}

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.DRAFT })
  status: VoucherStatus;

  @Column({ type: 'enum', enum: VoucherDiscountType, default: VoucherDiscountType.PERCENTAGE })
  discount_type: VoucherDiscountType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount_value: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_discount_amount: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  minimum_spend: number;

  @Column({ type: 'int', nullable: true })
  total_usage_limit: number | null;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'int', nullable: true })
  per_user_usage_limit: number | null;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'enum', enum: VoucherScopeType, default: VoucherScopeType.ALL })
  scope_type: VoucherScopeType;

  @Column({ type: 'boolean', default: true })
  is_stackable: boolean;

  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @Column({ type: 'boolean', default: false })
  is_delete: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'voucher_products',
    joinColumn: { name: 'voucher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'voucher_categories',
    joinColumn: { name: 'voucher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @ManyToMany(() => Brand)
  @JoinTable({
    name: 'voucher_brands',
    joinColumn: { name: 'voucher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'brand_id', referencedColumnName: 'id' },
  })
  brands: Brand[];
}
