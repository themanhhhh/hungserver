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

  async createOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      data: order,
    });
  }
}
