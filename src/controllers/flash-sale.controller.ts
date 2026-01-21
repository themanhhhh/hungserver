import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { FlashSale } from '../entities/FlashSale';
import { FlashSaleService } from '../services/flash-sale.service';
import { AppError } from '../middlewares/error.middleware';

export class FlashSaleController extends BaseController<FlashSale> {
  private flashSaleService: FlashSaleService;

  constructor() {
    const flashSaleService = new FlashSaleService();
    super(flashSaleService);
    this.flashSaleService = flashSaleService;
  }

  async findActiveFlashSales(req: Request, res: Response): Promise<void> {
    const flashSales = await this.flashSaleService.findActiveFlashSales();
    res.json({
      success: true,
      data: flashSales,
    });
  }

  async findWithProducts(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const flashSale = await this.flashSaleService.findWithProducts(id);

    if (!flashSale) {
      throw new AppError('Flash sale not found', 404);
    }

    res.json({
      success: true,
      data: flashSale,
    });
  }
}
