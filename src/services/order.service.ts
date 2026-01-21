import { BaseService } from './base.service';
import { Order } from '../entities/Order';
import { OrderRepository } from '../repositories/order.repository';
import { DeepPartial } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class OrderService extends BaseService<Order> {
  private orderRepository: OrderRepository;

  constructor() {
    const orderRepository = new OrderRepository();
    super(orderRepository);
    this.orderRepository = orderRepository;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.orderRepository.findByOrderNumber(orderNumber);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUser(userId);
  }

  async findWithDetails(id: string): Promise<Order | null> {
    return this.orderRepository.findWithDetails(id);
  }

  async createOrder(data: DeepPartial<Order>): Promise<Order> {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    return this.create({ ...data, order_number: orderNumber });
  }
}
