import { BaseRepository } from './base.repository';
import { OrderItem } from '../entities/OrderItem';

export class OrderItemRepository extends BaseRepository<OrderItem> {
  constructor() {
    super(OrderItem);
  }

  async findByOrder(orderId: string): Promise<OrderItem[]> {
    return this.repository.find({
      where: { order_id: orderId, is_delete: false },
      relations: ['product'],
    });
  }
}
