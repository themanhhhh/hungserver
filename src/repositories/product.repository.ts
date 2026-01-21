import { BaseRepository } from './base.repository';
import { Product } from '../entities/Product';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { slug, is_delete: false },
      relations: ['category', 'brand', 'product_images'],
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { sku, is_delete: false },
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.repository.find({
      where: { category_id: categoryId, is_active: true, is_delete: false },
    });
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    return this.repository.find({
      where: { brand_id: brandId, is_active: true, is_delete: false },
    });
  }

  async findWithRelations(id: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['category', 'brand', 'product_images', 'reviews'],
    });
  }
}
