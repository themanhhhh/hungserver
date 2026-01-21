import { BaseService } from './base.service';
import { FlashSale } from '../entities/FlashSale';
import { FlashSaleRepository } from '../repositories/flash-sale.repository';

export class FlashSaleService extends BaseService<FlashSale> {
  private flashSaleRepository: FlashSaleRepository;

  constructor() {
    const flashSaleRepository = new FlashSaleRepository();
    super(flashSaleRepository);
    this.flashSaleRepository = flashSaleRepository;
  }

  async findActiveFlashSales(): Promise<FlashSale[]> {
    return this.flashSaleRepository.findActiveFlashSales();
  }

  async findWithProducts(id: string): Promise<FlashSale | null> {
    return this.flashSaleRepository.findWithProducts(id);
  }
}
