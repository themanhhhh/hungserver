import { BaseService } from './base.service';
import { Review } from '../entities/Review';
import { ReviewRepository } from '../repositories/review.repository';

export class ReviewService extends BaseService<Review> {
  private reviewRepository: ReviewRepository;

  constructor() {
    const reviewRepository = new ReviewRepository();
    super(reviewRepository);
    this.reviewRepository = reviewRepository;
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepository.findByProduct(productId);
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.findByUser(userId);
  }

  async getAverageRating(productId: string): Promise<number> {
    return this.reviewRepository.getAverageRating(productId);
  }
}
