import { BaseService } from './base.service';
import { CartItem } from '../entities/CartItem';
import { CartItemRepository } from '../repositories/cart-item.repository';
import { DeepPartial } from 'typeorm';

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
}
