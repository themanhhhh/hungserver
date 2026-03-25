import { BaseService } from './base.service';
import { Collection } from '../entities/Collection';
import { CollectionRepository } from '../repositories/collection.repository';
import { AppDataSource } from '../data-source';

export class CollectionService extends BaseService<Collection> {
  private collectionRepository: CollectionRepository;

  constructor() {
    const collectionRepository = new CollectionRepository();
    super(collectionRepository);
    this.collectionRepository = collectionRepository;
  }

  async findBySlug(slug: string): Promise<Collection | null> {
    return this.collectionRepository.findBySlug(slug);
  }

  async create(data: any): Promise<Collection> {
    const { productIds, ...createData } = data;
    const collection = await super.create(createData);
    
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      await AppDataSource.transaction(async transactionalEntityManager => {
        await transactionalEntityManager.createQueryBuilder()
          .relation(Collection, 'products')
          .of(collection.id)
          .add(productIds);
      });
    }
    
    return (await this.findById(collection.id)) as Collection;
  }

  async update(id: string, data: any): Promise<Collection | null> {
    const { productIds, ...updateData } = data;
    
    // Chỉ cập nhật nếu có data khác ngoài productIds
    if (Object.keys(updateData).length > 0) {
      await super.update(id, updateData);
    }
    
    if (productIds && Array.isArray(productIds)) {
      const collection = await this.findById(id);
      const currentProductIds = collection?.products?.map((p: any) => p.id) || [];
      
      const toAdd = productIds.filter(pid => !currentProductIds.includes(pid));
      const toRemove = currentProductIds.filter(pid => !productIds.includes(pid));
      
      if (toAdd.length > 0 || toRemove.length > 0) {
        await AppDataSource.transaction(async transactionalEntityManager => {
          const qb = transactionalEntityManager.createQueryBuilder().relation(Collection, 'products').of(id);
          if (toAdd.length > 0) await qb.add(toAdd);
          if (toRemove.length > 0) await qb.remove(toRemove);
        });
      }
    }
    
    return this.findById(id);
  }
}
