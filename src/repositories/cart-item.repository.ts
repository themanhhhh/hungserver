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

  async findByCartAndItemId(cartId: string, itemId: string): Promise<CartItem | null> {
    return this.repository
      .createQueryBuilder('cart_item')
      .where('cart_item.id = :itemId', { itemId })
      .andWhere('cart_item.cart_id = :cartId', { cartId })
      .andWhere('cart_item.is_delete = :isDelete', { isDelete: false })
      .getOne();
  }

  async findByCartAndProductOrItemId(cartId: string, identifier: string): Promise<CartItem | null> {
    return this.repository
      .createQueryBuilder('cart_item')
      .where('cart_item.cart_id = :cartId', { cartId })
      .andWhere('cart_item.is_delete = :isDelete', { isDelete: false })
      .andWhere('(cart_item.product_id = :identifier OR cart_item.id = :identifier)', { identifier })
      .getOne();
  }

  async removeByCartAndProduct(cartId: string, productId: string): Promise<boolean> {
    const item = await this.findByCartAndProduct(cartId, productId);
    if (!item) return false;
    await this.repository.remove(item);
    return true;
  }

  async removeByCartAndProductOrItemId(cartId: string, identifier: string): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(CartItem)
      .where('cart_id = :cartId', { cartId })
      .andWhere('(product_id = :identifier OR id = :identifier)', { identifier })
      .execute();

    return (result.affected || 0) > 0;
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
