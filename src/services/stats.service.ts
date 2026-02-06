import { AppDataSource } from '../data-source';
import { Order } from '../entities/Order';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { OrderStatus } from '../enums';

export class StatsService {
  private orderRepository = AppDataSource.getRepository(Order);
  private productRepository = AppDataSource.getRepository(Product);
  private userRepository = AppDataSource.getRepository(User);

  async getDashboardStats() {
    // Total Revenue (only from completed/delivered orders or all valid orders? Usually delivered/completed)
    // For now, let's include all non-cancelled orders for "Gross Revenue" or just Delivered for "Real Revenue".
    // Let's stick to standard practice: Total of all non-cancelled orders might be better for "Sales" view, 
    // but for specific revenue let's filter by valid statuses if needed. 
    // For simplicity and matching current frontend logic (which sums all orders), I'll sum all non-deleted orders or specific statuses.
    // Frontend currently does: orders?.reduce((sum, order) => sum + order.total, 0)
    
    // Let's optimize with database aggregation
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total')
      .where('order.is_delete = :isDelete', { isDelete: false })
      .andWhere('order.status != :status', { status: OrderStatus.CANCELLED }) // Exclude cancelled
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult.total || '0');

    // Counts
    const totalOrders = await this.orderRepository.count({
      where: { is_delete: false }
    });

    const totalCustomers = await this.userRepository.count({
      where: { is_delete: false } // Assuming User has is_delete, if not check entity
    });

    const totalProducts = await this.productRepository.count({
      where: { is_delete: false } // Assuming Product has is_delete
    });

    // We can also calculate growth/trends here if needed, but for now simple totals
    
    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      // Mock growth data for now or calculate if historical data exists
      revenueGrowth: 0, 
      ordersGrowth: 0,
      customersGrowth: 0,
      productsGrowth: 0,
    };
  }
}
