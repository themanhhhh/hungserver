import { BaseRepository } from './base.repository';
import { Brand } from '../entities/Brand';

export class BrandRepository extends BaseRepository<Brand> {
  constructor() {
    super(Brand);
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    return this.repository.findOne({
      where: { slug, is_delete: false },
    });
  }
}
