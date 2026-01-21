import { Request, Response } from 'express';
import { BaseController } from './base.controller';
import { Cart } from '../entities/Cart';
import { CartService } from '../services/cart.service';
import { CartItemService } from '../services/cart-item.service';

export class CartController extends BaseController<Cart> {
  private cartService: CartService;
  private cartItemService: CartItemService;

  constructor() {
    const cartService = new CartService();
    super(cartService);
    this.cartService = cartService;
    this.cartItemService = new CartItemService();
  }

  async findByUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cart = await this.cartService.findByUser(userId);
    res.json({
      success: true,
      data: cart,
    });
  }

  async getOrCreateCart(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cart = await this.cartService.getOrCreateCart(userId);
    res.json({
      success: true,
      data: cart,
    });
  }

  async addItem(req: Request, res: Response): Promise<void> {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;
    
    const cartItem = await this.cartItemService.addToCart(cartId, productId, quantity);
    res.status(201).json({
      success: true,
      data: cartItem,
    });
  }
}
