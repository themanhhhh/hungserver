import { DeepPartial } from 'typeorm';
import { BaseService } from './base.service';
import { Product } from '../entities/Product';
import { ProductImage } from '../entities/ProductImage';
import { ProductRepository } from '../repositories/product.repository';
import { AppDataSource } from '../data-source';

export class ProductService extends BaseService<Product> {
  private productRepository: ProductRepository;

  constructor() {
    const productRepository = new ProductRepository();
    super(productRepository);
    this.productRepository = productRepository;
  }

  // Override update to handle images
  async update(id: string, data: DeepPartial<Product> & { images?: { url: string; display_order?: number }[] }): Promise<Product | null> {
    const { images, ...productData } = data as any;

    // Update product fields (without images)
    const product = await super.update(id, productData);
    if (!product) return null;

    // If images array is provided, sync product_images
    if (images && Array.isArray(images)) {
      const imageRepo = AppDataSource.getRepository(ProductImage);

      // Delete existing images for this product
      await imageRepo.delete({ product_id: id });

      // Create new images
      if (images.length > 0) {
        const newImages = images.map((img: any, index: number) => {
          return imageRepo.create({
            product_id: id,
            image_url: img.url || img.image_url,
            is_primary: index === 0,
            display_order: img.display_order ?? index,
          });
        });
        await imageRepo.save(newImages);
      }
    }

    // Return product with updated images
    return this.productRepository.findWithRelations(id);
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
