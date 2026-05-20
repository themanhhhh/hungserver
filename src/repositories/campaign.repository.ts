import { BaseRepository } from './base.repository';
import { Campaign, CampaignStatus } from '../entities/Campaign';
import { Product } from '../entities/Product';
import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AppError } from '../middlewares/error.middleware';

export class CampaignRepository extends BaseRepository<Campaign> {
  constructor() {
    super(Campaign);
  }

  async findAll(options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { is_delete: false } as FindOptionsWhere<Campaign>,
      relations: ['products', 'products.product_images', 'products.brand', 'products.category'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Campaign | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['products', 'products.product_images', 'products.brand', 'products.category'],
    });
  }

  async findByCode(code: string): Promise<Campaign | null> {
    return this.repository.findOne({
      where: { code, is_delete: false },
      relations: ['products', 'products.product_images', 'products.brand', 'products.category'],
    });
  }

  async findActiveCampaigns(): Promise<Campaign[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        status: CampaignStatus.ACTIVE,
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
        is_delete: false,
      },
      relations: ['products', 'products.product_images', 'products.brand', 'products.category'],
      order: { display_order: 'ASC' },
    });
  }

  async findActiveForHomepage(): Promise<Campaign[]> {
    const now = new Date();
    return this.repository.find({
      where: {
        status: CampaignStatus.ACTIVE,
        show_on_homepage: true,
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
        is_delete: false,
      },
      relations: ['products', 'products.product_images', 'products.brand', 'products.category'],
      order: { display_order: 'ASC' },
    });
  }

  async addProducts(campaignId: string, productIds: string[]): Promise<Campaign | null> {
    const campaign = await this.repository.findOne({
      where: { id: campaignId },
      relations: ['products'],
    });

    if (!campaign) {
      return null;
    }

    const productRepository = AppDataSource.getRepository(Product);
    const uniqueProductIds = [...new Set(productIds)];
    const products = uniqueProductIds.length > 0
      ? await productRepository.find({
          where: { id: In(uniqueProductIds), is_delete: false, is_active: true },
        })
      : [];

    if (products.length !== uniqueProductIds.length) {
      throw new AppError('Một hoặc nhiều sản phẩm không tồn tại hoặc đã ngừng bán', 400);
    }

    // Add new products (avoid duplicates)
    const existingIds = campaign.products?.map(p => p.id) || [];
    const newProducts = products.filter(p => !existingIds.includes(p.id));
    campaign.products = [...(campaign.products || []), ...newProducts];

    return this.repository.save(campaign);
  }

  async removeProducts(campaignId: string, productIds: string[]): Promise<Campaign | null> {
    const campaign = await this.repository.findOne({
      where: { id: campaignId },
      relations: ['products'],
    });

    if (!campaign) {
      return null;
    }

    campaign.products = (campaign.products || []).filter(p => !productIds.includes(p.id));

    return this.repository.save(campaign);
  }
}


