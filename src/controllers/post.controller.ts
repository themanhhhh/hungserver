import { Request, Response } from 'express';
import { PostService } from '../services/post.service';
import { AppError } from '../middlewares/error.middleware';

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.postService.findAllPaginated(page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  async findPublished(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.postService.findPublishedPaginated(page, limit);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }

  async findById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const post = await this.postService.findById(id);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({
      success: true,
      data: post,
    });
  }

  async findBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const post = await this.postService.findBySlug(slug);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    await this.postService.incrementViewCount(post.id);

    res.json({
      success: true,
      data: post,
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    const post = await this.postService.createPost(req.body);

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully',
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const post = await this.postService.updatePost(id, req.body);

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    res.json({
      success: true,
      data: post,
      message: 'Post updated successfully',
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const deleted = await this.postService.delete(id);

    if (!deleted) {
      throw new AppError('Post not found', 404);
    }

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  }
}
