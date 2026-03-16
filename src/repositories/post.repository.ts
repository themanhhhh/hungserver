import { BaseRepository } from './base.repository';
import { Post, PostStatus } from '../entities/Post';
import { MoreThanOrEqual } from 'typeorm';

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(Post);
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return this.repository.findOne({
      where: { slug, is_delete: false },
    });
  }

  async findPublished(): Promise<Post[]> {
    return this.repository.find({
      where: {
        status: PostStatus.PUBLISHED,
        is_delete: false,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findPublishedWithPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: {
        status: PostStatus.PUBLISHED,
        is_delete: false,
      },
      relations: ['author'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllWithPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where: { is_delete: false } as any,
      relations: ['author'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'view_count', 1);
  }
}
