import { BaseRepository } from './base.repository';
import { Campaign, CampaignStatus } from '../entities/Campaign';
import { Product } from '../entities/Product';
import { LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { AppDataSource } from '../data-source';

export class CampaignRepository extends BaseRepository<Campaign> {
  constructor() {
    super(Campaign);
  }

  async findByCode(code: string): Promise<Campaign | null> {
    return this.repository.findOne({
      where: { code, is_delete: false },
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
      relations: ['products', 'products.images', 'products.brand', 'products.category'],
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
    const products = await productRepository.find({
      where: { id: In(productIds) },
    });

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


