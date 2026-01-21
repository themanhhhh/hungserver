import { BaseRepository } from './base.repository';
import { Category } from '../entities/Category';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { slug, is_delete: false },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.repository.find({
      where: { parent_id: undefined, is_active: true, is_delete: false },
    });
  }

  async findWithChildren(id: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['children'],
    });
  }
}
