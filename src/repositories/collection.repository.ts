import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { Collection } from '../entities/Collection';

export class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super(Collection);
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<Collection>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { is_delete: false },
      skip,
      take: limit,
      relations: ['products'],
      order: { id: 'DESC' } // Default sort newest first for collections
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Collection | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['products'],
    });
  }

  async findBySlug(slug: string): Promise<Collection | null> {
    return this.repository.findOne({
      where: { slug, is_active: true, is_delete: false },
      relations: ['products', 'products.product_images'],
    });
  }
}
