import { BaseService } from './base.service';
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { User } from '../entities/User';
import { OrderRepository } from '../repositories/order.repository';
import { DeepPartial } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../data-source';
import { EmailService } from './email.service';

export class OrderService extends BaseService<Order> {
  private orderRepository: OrderRepository;
  private emailService: EmailService;

  constructor() {
    const orderRepository = new OrderRepository();
    super(orderRepository);
    this.orderRepository = orderRepository;
    this.emailService = new EmailService();
  }

  async findAllWithFilters(options?: any): Promise<any> {
    return this.orderRepository.findAllWithFilters(options);
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

  async createOrder(data: any): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    
    // Extract items from request body
    const items = data.items || [];
    
    // Generate OTP
    const otpCode = this.emailService.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create the order (without items, they go in order_items table)
    const orderData: DeepPartial<Order> = {
      order_number: orderNumber,
      user_id: data.user_id || data.userId,
      total: data.total || 0,
      status: data.status || 'pending',
      payment_status: data.payment_status || data.paymentStatus || 'pending',
      campaign_id: data.campaign_id || data.campaignId || undefined,
      otp_code: otpCode,
      otp_expires_at: otpExpiresAt,
      is_verified: false,
    };
    
    const order = await this.create(orderData);
    
    // Create order items
    if (items.length > 0) {
      const orderItemRepo = AppDataSource.getRepository(OrderItem);
      const orderItems = items.map((item: any) => orderItemRepo.create({
        order_id: order.id,
        product_id: item.product_id || item.productId,
        price: item.price,
        quantity: item.quantity,
      }));
      await orderItemRepo.save(orderItems);
      order.order_items = orderItems;
    }
    
    // Send OTP email to user
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: order.user_id } });
      if (user?.email) {
        await this.emailService.sendOrderOTP(user.email, otpCode, orderNumber, order.total);
      }
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // Don't throw — order is still created, user can request resend
    }
    
    return order;
  }

  async verifyOTP(orderId: string, otpCode: string): Promise<{ success: boolean; message: string }> {
    const order = await this.orderRepository.findWithDetails(orderId);

    if (!order) {
      return { success: false, message: 'Đơn hàng không tồn tại' };
    }

    if (order.is_verified) {
      return { success: true, message: 'Đơn hàng đã được xác nhận' };
    }

    if (!order.otp_code) {
      return { success: false, message: 'Mã OTP không hợp lệ' };
    }

    if (new Date() > new Date(order.otp_expires_at)) {
      return { success: false, message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.' };
    }

    if (order.otp_code !== otpCode) {
      return { success: false, message: 'Mã OTP không đúng' };
    }

    // Mark as verified
    await this.update(orderId, {
      is_verified: true,
      otp_code: undefined, // Clear OTP after verification
    } as any);

    return { success: true, message: 'Xác nhận đơn hàng thành công!' };
  }

  async resendOTP(orderId: string): Promise<{ success: boolean; message: string }> {
    const order = await this.orderRepository.findWithDetails(orderId);

    if (!order) {
      return { success: false, message: 'Đơn hàng không tồn tại' };
    }

    if (order.is_verified) {
      return { success: true, message: 'Đơn hàng đã được xác nhận' };
    }

    // Generate new OTP
    const otpCode = this.emailService.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.update(orderId, {
      otp_code: otpCode,
      otp_expires_at: otpExpiresAt,
    } as any);

    // Send email
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: order.user_id } });
      if (user?.email) {
        await this.emailService.sendOrderOTP(user.email, otpCode, order.order_number, order.total);
      }
    } catch (error) {
      console.error('Failed to resend OTP email:', error);
      return { success: false, message: 'Không thể gửi email. Vui lòng thử lại.' };
    }

    return { success: true, message: 'Đã gửi lại mã OTP' };
  }
}
