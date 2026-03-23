import { BaseRepository } from './base.repository';
import { Shipment } from '../entities/Shipment';

export class ShipmentRepository extends BaseRepository<Shipment> {
  constructor() {
    super(Shipment);
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    return this.repository.find({
      where: { order_id: orderId, is_delete: false },
      relations: ['order', 'order.order_items', 'order.order_items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async findByOrderIdActive(orderId: string): Promise<Shipment | null> {
    return this.repository.findOne({
      where: { order_id: orderId, is_delete: false, is_return: false },
      relations: ['order', 'order.order_items', 'order.order_items.product'],
    });
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    return this.repository.findOne({
      where: { tracking_number: trackingNumber, is_delete: false },
      relations: ['order', 'order.user'],
    });
  }

  async findByCarrier(carrier: string): Promise<Shipment[]> {
    return this.repository.find({
      where: { carrier, is_delete: false },
      relations: ['order'],
      order: { created_at: 'DESC' },
    });
  }

  async findPendingPickup(): Promise<Shipment[]> {
    return this.repository.find({
      where: { 
        is_delete: false, 
        is_return: false 
      },
      relations: ['order', 'order.order_items'],
      order: { created_at: 'ASC' },
    });
  }
}
