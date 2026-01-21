import { BaseRepository } from './base.repository';
import { FlashSale } from '../entities/FlashSale';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export class FlashSaleRepository extends BaseRepository<FlashSale> {
  constructor() {
    super(FlashSale);
  }

  async findActiveFlashSales(): Promise<FlashSale[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        start_time: LessThanOrEqual(now),
        end_time: MoreThanOrEqual(now),
        is_active: true,
        is_delete: false,
      },
      relations: ['flash_sale_products', 'flash_sale_products.product'],
    });
  }

  async findWithProducts(id: string): Promise<FlashSale | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['flash_sale_products', 'flash_sale_products.product'],
    });
  }
}
