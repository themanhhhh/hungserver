import { BaseService } from './base.service';
import { ProductImage } from '../entities/ProductImage';
import { ProductImageRepository } from '../repositories/product-image.repository';

export class ProductImageService extends BaseService<ProductImage> {
  private productImageRepository: ProductImageRepository;

  constructor() {
    const productImageRepository = new ProductImageRepository();
    super(productImageRepository);
    this.productImageRepository = productImageRepository;
  }

  async findByProduct(productId: string): Promise<ProductImage[]> {
    return this.productImageRepository.findByProduct(productId);
  }

  async findPrimaryImage(productId: string): Promise<ProductImage | null> {
    return this.productImageRepository.findPrimaryImage(productId);
  }
}
