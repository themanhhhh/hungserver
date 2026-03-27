import { BaseService } from './base.service';
import { CartItem } from '../entities/CartItem';
import { CartItemRepository } from '../repositories/cart-item.repository';

export class CartItemService extends BaseService<CartItem> {
  private cartItemRepository: CartItemRepository;

  constructor() {
    const cartItemRepository = new CartItemRepository();
    super(cartItemRepository);
    this.cartItemRepository = cartItemRepository;
  }

  async findByCart(cartId: string): Promise<CartItem[]> {
    return this.cartItemRepository.findByCart(cartId);
  }

  async addToCart(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    const existingItem = await this.cartItemRepository.findByCartAndProduct(cartId, productId);
    
    if (existingItem) {
      return this.update(existingItem.id, { 
        quantity: existingItem.quantity + quantity 
      }) as Promise<CartItem>;
    }

    return this.create({
      cart_id: cartId,
      product_id: productId,
      quantity,
    });
  }

  async updateQuantity(cartId: string, productId: string, quantity: number): Promise<CartItem | null> {
    const item = await this.cartItemRepository.findByCartAndProductOrItemId(cartId, productId);
    if (!item) return null;

    if (quantity <= 0) {
      await this.cartItemRepository.removeByCartAndProductOrItemId(cartId, productId);
      return null;
    }

    return this.update(item.id, { quantity }) as Promise<CartItem>;
  }

  async removeFromCart(cartId: string, productId: string): Promise<boolean> {
    return this.cartItemRepository.removeByCartAndProductOrItemId(cartId, productId);
  }

  async clearCart(cartId: string): Promise<void> {
    return this.cartItemRepository.clearByCart(cartId);
  }
}
