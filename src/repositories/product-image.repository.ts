import { BaseRepository } from './base.repository';
import { ProductImage } from '../entities/ProductImage';

export class ProductImageRepository extends BaseRepository<ProductImage> {
  constructor() {
    super(ProductImage);
  }

  async findByProduct(productId: string): Promise<ProductImage[]> {
    return this.repository.find({
      where: { product_id: productId, is_delete: false },
    });
  }

  async findPrimaryImage(productId: string): Promise<ProductImage | null> {
    return this.repository.findOne({
      where: { product_id: productId, is_primary: true, is_delete: false },
    });
  }
}
