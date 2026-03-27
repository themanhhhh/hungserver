import { BaseRepository } from './base.repository';
import { CartItem } from '../entities/CartItem';

export class CartItemRepository extends BaseRepository<CartItem> {
  constructor() {
    super(CartItem);
  }

  async findByCart(cartId: string): Promise<CartItem[]> {
    return this.repository.find({
      where: { cart_id: cartId, is_delete: false },
      relations: ['product', 'product.brand', 'product.product_images'],
    });
  }

  async findByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null> {
    return this.repository.findOne({
      where: { cart_id: cartId, product_id: productId, is_delete: false },
    });
  }

  async removeByCartAndProduct(cartId: string, productId: string): Promise<boolean> {
    const item = await this.findByCartAndProduct(cartId, productId);
    if (!item) return false;
    await this.repository.remove(item);
    return true;
  }

  async clearByCart(cartId: string): Promise<void> {
    const items = await this.repository.find({
      where: { cart_id: cartId, is_delete: false },
    });
    if (items.length > 0) {
      await this.repository.remove(items);
    }
  }
}
