import { BaseService } from './base.service';
import { FlashSaleProduct } from '../entities/FlashSaleProduct';
import { FlashSaleProductRepository } from '../repositories/flash-sale-product.repository';

export class FlashSaleProductService extends BaseService<FlashSaleProduct> {
  private flashSaleProductRepository: FlashSaleProductRepository;

  constructor() {
    const flashSaleProductRepository = new FlashSaleProductRepository();
    super(flashSaleProductRepository);
    this.flashSaleProductRepository = flashSaleProductRepository;
  }

  async findByFlashSale(flashSaleId: string): Promise<FlashSaleProduct[]> {
    return this.flashSaleProductRepository.findByFlashSale(flashSaleId);
  }

  async findByProduct(productId: string): Promise<FlashSaleProduct[]> {
    return this.flashSaleProductRepository.findByProduct(productId);
  }
}
