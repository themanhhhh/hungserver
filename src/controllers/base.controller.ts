import { Request, Response } from 'express';
import { BaseService } from '../services/base.service';
import { AppError } from '../middlewares/error.middleware';

export abstract class BaseController<T extends { id: string; is_delete: boolean }> {
  protected service: BaseService<T>;

  constructor(service: BaseService<T>) {
    this.service = service;
  }

  async findAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.service.findAll({ page, limit });
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
    const entity = await this.service.findById(id);

    if (!entity) {
      throw new AppError('Resource not found', 404);
    }

    res.json({
      success: true,
      data: entity,
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    const entity = await this.service.create(req.body);
    res.status(201).json({
      success: true,
      data: entity,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const entity = await this.service.update(id, req.body);

    if (!entity) {
      throw new AppError('Resource not found', 404);
    }

    res.json({
      success: true,
      data: entity,
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const success = await this.service.delete(id);

    if (!success) {
      throw new AppError('Resource not found', 404);
    }

    res.json({
      success: true,
      message: 'Resource deleted successfully',
    });
  }
}
