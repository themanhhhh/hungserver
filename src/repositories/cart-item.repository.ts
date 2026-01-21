import { BaseRepository } from './base.repository';
import { CartItem } from '../entities/CartItem';

export class CartItemRepository extends BaseRepository<CartItem> {
  constructor() {
    super(CartItem);
  }

  async findByCart(cartId: string): Promise<CartItem[]> {
    return this.repository.find({
      where: { cart_id: cartId, is_delete: false },
      relations: ['product'],
    });
  }

  async findByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    return this.repository.findOne({
      where: { cart_id: cartId, product_id: productId, is_delete: false },
    });
  }
}
