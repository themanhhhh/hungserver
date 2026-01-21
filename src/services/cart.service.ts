import { BaseService } from './base.service';
import { Cart } from '../entities/Cart';
import { CartRepository } from '../repositories/cart.repository';

export class CartService extends BaseService<Cart> {
  private cartRepository: CartRepository;

  constructor() {
    const cartRepository = new CartRepository();
    super(cartRepository);
    this.cartRepository = cartRepository;
  }

  async findByUser(userId: string): Promise<Cart | null> {
    return this.cartRepository.findByUser(userId);
  }

  async findWithItems(id: string): Promise<Cart | null> {
    return this.cartRepository.findWithItems(id);
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findByUser(userId);
    if (!cart) {
      cart = await this.create({ user_id: userId });
    }
    return cart;
  }
}
