import { BaseRepository } from './base.repository';
import { FlashSaleProduct } from '../entities/FlashSaleProduct';

export class FlashSaleProductRepository extends BaseRepository<FlashSaleProduct> {
  constructor() {
    super(FlashSaleProduct);
  }

  async findByFlashSale(flashSaleId: string): Promise<FlashSaleProduct[]> {
    return this.repository.find({
      where: { flash_sale_id: flashSaleId, is_delete: false },
      relations: ['product'],
    });
  }

  async findByProduct(productId: string): Promise<FlashSaleProduct[]> {
    return this.repository.find({
      where: { product_id: productId, is_delete: false },
      relations: ['flash_sale'],
    });
  }
}
