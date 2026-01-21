import { BaseRepository } from './base.repository';
import { Campaign } from '../entities/Campaign';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

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
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
        is_delete: false,
      },
    });
  }
}
