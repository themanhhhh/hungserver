import { DeepPartial } from 'typeorm';
import { BaseRepository, PaginationOptions, PaginatedResult } from '../repositories/base.repository';

export abstract class BaseService<T extends { id: string; is_delete: boolean }> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<T>> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.softDelete(id);
  }
}
