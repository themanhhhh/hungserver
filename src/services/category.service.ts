import { BaseService } from './base.service';
import { Category } from '../entities/Category';
import { CategoryRepository } from '../repositories/category.repository';

export class CategoryService extends BaseService<Category> {
  private categoryRepository: CategoryRepository;

  constructor() {
    const categoryRepository = new CategoryRepository();
    super(categoryRepository);
    this.categoryRepository = categoryRepository;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryRepository.findBySlug(slug);
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.findRootCategories();
  }

  async findWithChildren(id: string): Promise<Category | null> {
    return this.categoryRepository.findWithChildren(id);
  }
}
