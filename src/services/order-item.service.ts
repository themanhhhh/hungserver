import { BaseService } from './base.service';
import { OrderItem } from '../entities/OrderItem';
import { OrderItemRepository } from '../repositories/order-item.repository';

export class OrderItemService extends BaseService<OrderItem> {
  private orderItemRepository: OrderItemRepository;

  constructor() {
    const orderItemRepository = new OrderItemRepository();
    super(orderItemRepository);
    this.orderItemRepository = orderItemRepository;
  }

  async findByOrder(orderId: string): Promise<OrderItem[]> {
    return this.orderItemRepository.findByOrder(orderId);
  }
}
