import { BaseService } from './base.service';
import { Post, PostStatus } from '../entities/Post';
import { PostRepository } from '../repositories/post.repository';

export class PostService extends BaseService<Post> {
  private postRepository: PostRepository;

  constructor() {
    const postRepository = new PostRepository();
    super(postRepository);
    this.postRepository = postRepository;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    return this.postRepository.findBySlug(slug);
  }

  async findPublished(): Promise<Post[]> {
    return this.postRepository.findPublished();
  }

  async findPublishedPaginated(page: number = 1, limit: number = 10) {
    return this.postRepository.findPublishedWithPagination(page, limit);
  }

  async findAllPaginated(page: number = 1, limit: number = 10) {
    return this.postRepository.findAllWithPagination(page, limit);
  }

  async incrementViewCount(id: string): Promise<void> {
    return this.postRepository.incrementViewCount(id);
  }

  async createPost(data: Partial<Post>): Promise<Post> {
    const slug = this.generateSlug(data.title || '');
    return this.postRepository.create({
      ...data,
      slug,
      status: data.status || PostStatus.DRAFT,
      view_count: 0,
    });
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post | null> {
    const existingPost = await this.postRepository.findById(id);
    if (!existingPost) return null;

    let slug = existingPost.slug;
    if (data.title && data.title !== existingPost.title) {
      slug = this.generateSlug(data.title);
    }

    return this.postRepository.update(id, {
      ...data,
      slug,
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      + '-' + Date.now().toString(36);
  }
}
