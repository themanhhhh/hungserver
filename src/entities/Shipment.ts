import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ShipmentStatus, ShippingMethod, CarrierService } from '../enums';
import { Order } from './Order';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  order_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tracking_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  carrier: string;

  @Column({
    type: 'enum',
    enum: CarrierService,
    default: CarrierService.STANDARD,
  })
  carrier_service: CarrierService;

  @Column({
    type: 'enum',
    enum: ShippingMethod,
    default: ShippingMethod.SELLER_FULFILLMENT,
  })
  shipping_method: ShippingMethod;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pickup_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pickup_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pickup_phone: string;

  @Column({ type: 'text', nullable: true })
  pickup_note: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  delivery_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  delivery_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  delivery_phone: string;

  @Column({ type: 'timestamp', nullable: true })
  estimated_delivery: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_delivery: Date;

  @Column({ type: 'timestamp', nullable: true })
  shipped_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  picked_up_at: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  shipping_fee: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  package_dimension: string;

  @Column({ type: 'text', nullable: true })
  tracking_history: string;

  @Column({ type: 'boolean', default: false })
  is_return: boolean;

  @Column({ type: 'boolean', default: false })
  is_delete: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Order, (order) => order.shipments)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
