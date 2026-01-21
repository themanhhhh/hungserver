import { BaseService } from './base.service';
import { Campaign } from '../entities/Campaign';
import { CampaignRepository } from '../repositories/campaign.repository';

export class CampaignService extends BaseService<Campaign> {
  private campaignRepository: CampaignRepository;

  constructor() {
    const campaignRepository = new CampaignRepository();
    super(campaignRepository);
    this.campaignRepository = campaignRepository;
  }

  async findByCode(code: string): Promise<Campaign | null> {
    return this.campaignRepository.findByCode(code);
  }

  async findActiveCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.findActiveCampaigns();
  }

  async validateCampaign(code: string): Promise<{ valid: boolean; campaign?: Campaign; message: string }> {
    const campaign = await this.findByCode(code);
    
    if (!campaign) {
      return { valid: false, message: 'Campaign not found' };
    }

    const now = new Date();
    if (now < campaign.start_date) {
      return { valid: false, message: 'Campaign has not started yet' };
    }

    if (now > campaign.end_date) {
      return { valid: false, message: 'Campaign has expired' };
    }

    return { valid: true, campaign, message: 'Campaign is valid' };
  }
}
