import { BaseService } from './base.service';
import { Brand } from '../entities/Brand';
import { BrandRepository } from '../repositories/brand.repository';

export class BrandService extends BaseService<Brand> {
  private brandRepository: BrandRepository;

  constructor() {
    const brandRepository = new BrandRepository();
    super(brandRepository);
    this.brandRepository = brandRepository;
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    return this.brandRepository.findBySlug(slug);
  }
}
