import { BaseRepository } from './base.repository';
import { Review } from '../entities/Review';

export class ReviewRepository extends BaseRepository<Review> {
  constructor() {
    super(Review);
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.repository.find({
      where: { product_id: productId, is_delete: false },
      relations: ['user'],
      order: { rating: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.repository.find({
      where: { user_id: userId, is_delete: false },
      relations: ['product'],
    });
  }

  async getAverageRating(productId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.product_id = :productId', { productId })
      .andWhere('review.is_delete = false')
      .getRawOne();
    return parseFloat(result?.avg) || 0;
  }
}
