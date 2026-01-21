import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { DiscountType } from '../enums';
import { Order } from './Order';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  discount_type: DiscountType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discount_value: number;

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'boolean', default: false })
  is_delete: boolean;

  // Relations
  @OneToMany(() => Order, (order) => order.campaign)
  orders: Order[];
}
