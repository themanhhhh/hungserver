import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Order } from '../entities/Order';
import { OrderService } from '../services/order.service';
import { AppError } from '../middlewares/error.middleware';

export class OrderController extends BaseController<Order> {
  private orderService: OrderService;

  constructor() {
    const orderService = new OrderService();
    super(orderService);
    this.orderService = orderService;
  }

  async findByOrderNumber(req: Request, res: Response): Promise<void> {
    const { orderNumber } = req.params;
    const order = await this.orderService.findByOrderNumber(orderNumber);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      success: true,
      data: order,
    });
  }

  async findByUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const orders = await this.orderService.findByUser(userId);
    res.json({
      success: true,
      data: orders,
    });
  }

  // Override findById to include order_items and product relations
  async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const order = await this.orderService.findWithDetails(id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      success: true,
      data: order,
    });
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    // Extract user from JWT token (set by authenticate middleware)
    const authUser = (req as any).user;
    const userId = authUser?.id || req.body.user_id || req.body.userId;
    
    if (!userId) {
      throw new AppError('User authentication required', 401);
    }
    
    const order = await this.orderService.createOrder({
      ...req.body,
      user_id: userId,
    });
    res.status(201).json({
      success: true,
      data: order,
    });
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      throw new AppError('Vui lòng nhập mã OTP', 400);
    }

    const result = await this.orderService.verifyOTP(id, otp);

    res.json({
      success: result.success,
      message: result.message,
    });
  }

  async resendOTP(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.orderService.resendOTP(id);

    res.json({
      success: result.success,
      message: result.message,
    });
  }
}
