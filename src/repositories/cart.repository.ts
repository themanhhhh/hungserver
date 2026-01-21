import { BaseRepository } from './base.repository';
import { Cart } from '../entities/Cart';

export class CartRepository extends BaseRepository<Cart> {
  constructor() {
    super(Cart);
  }

  async findByUser(userId: string): Promise<Cart | null> {
    return this.repository.findOne({
      where: { user_id: userId, is_delete: false },
      relations: ['cart_items', 'cart_items.product'],
    });
  }

  async findWithItems(id: string): Promise<Cart | null> {
    return this.repository.findOne({
      where: { id, is_delete: false },
      relations: ['cart_items', 'cart_items.product'],
    });
  }
}
