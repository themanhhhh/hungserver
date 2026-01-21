import { BaseService } from './base.service';
import { Product } from '../entities/Product';
import { ProductRepository } from '../repositories/product.repository';

export class ProductService extends BaseService<Product> {
  private productRepository: ProductRepository;

  constructor() {
    const productRepository = new ProductRepository();
    super(productRepository);
    this.productRepository = productRepository;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.productRepository.findBySlug(slug);
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findBySku(sku);
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.findByCategory(categoryId);
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    return this.productRepository.findByBrand(brandId);
  }

  async findWithRelations(id: string): Promise<Product | null> {
    return this.productRepository.findWithRelations(id);
  }
}
