import { BaseRepository } from './base.repository';
import { Order } from '../entities/Order';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(Order);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { order_number: orderNumber, is_delete: false },
      relations: ['order_items', 'user'],
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { user_id: userId, is_delete: false },
      relations: ['order_items'],
      order: { created_at: 'DESC' },
    });
  }

  async findWithDetails(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['order_items', 'order_items.product', 'user', 'campaign'],
    });
  }
}
