import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { Order } from '../entities/Order';

export interface OrderFilterOptions extends PaginationOptions {
  search?: string;
  status?: string;
  date?: string;
}

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(Order);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { order_number: orderNumber, is_delete: false },
      relations: ['order_items', 'order_items.product', 'order_items.product.product_images', 'user'],
    });
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.repository.find({
      where: { user_id: userId, is_delete: false },
      relations: ['order_items', 'order_items.product', 'order_items.product.product_images'],
      order: { created_at: 'DESC' },
    });
  }

  async findWithDetails(id: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['order_items', 'order_items.product', 'order_items.product.product_images', 'user', 'campaign'],
    });
  }

  async findAllWithFilters(options?: OrderFilterOptions): Promise<PaginatedResult<Order>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('order')
      .leftJoinAndSelect('order.order_items', 'order_items')
      .leftJoinAndSelect('order_items.product', 'product')
      .leftJoinAndSelect('product.product_images', 'product_images')
      .leftJoinAndSelect('order.user', 'user')
      .where('order.is_delete = :isDelete', { isDelete: false });

    if (options?.status && options.status !== 'all') {
      // Map frontend 'pending', 'processing', 'shipped' etc.
      queryBuilder.andWhere('order.status = :status', { status: options.status });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(order.order_number ILIKE :search OR user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    if (options?.date) {
      const startDate = new Date(options.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(options.date);
      endDate.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('order.created_at >= :startDate AND order.created_at <= :endDate', { startDate, endDate });
    }

    queryBuilder.orderBy('order.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
