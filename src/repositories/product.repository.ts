import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { Product } from '../entities/Product';
import { FindOptionsWhere } from 'typeorm';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  // Override findAll to include relations
  async findAll(options?: PaginationOptions): Promise<PaginatedResult<Product>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { is_delete: false, is_active: true } as FindOptionsWhere<Product>,
      relations: ['category', 'brand', 'product_images'],
      skip,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
      relations: ['category', 'brand', 'product_images'],
    });
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    return this.repository.find({
      where: { brand_id: brandId, is_active: true, is_delete: false },
      relations: ['category', 'brand', 'product_images'],
    });
  }

  async findWithRelations(id: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['category', 'brand', 'product_images', 'reviews'],
    });
  }
}
