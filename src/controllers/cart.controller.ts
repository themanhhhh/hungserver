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
    // Reload with full relations
    const fullCart = await this.cartService.findWithItems(cart.id);
    res.json({
      success: true,
      data: fullCart || cart,
    });
  }

  async addItem(req: Request, res: Response): Promise<void> {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;
    
    await this.cartItemService.addToCart(cartId, productId, quantity);
    // Return full cart with updated items
    const cart = await this.cartService.findWithItems(cartId);
    res.status(201).json({
      success: true,
      data: cart,
    });
  }

  async updateItemQuantity(req: Request, res: Response): Promise<void> {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    await this.cartItemService.updateQuantity(cartId, productId, quantity);
    const cart = await this.cartService.findWithItems(cartId);
    res.json({
      success: true,
      data: cart,
    });
  }

  async removeItem(req: Request, res: Response): Promise<void> {
    const { cartId, productId } = req.params;

    const removed = await this.cartItemService.removeFromCart(cartId, productId);
    if (!removed) {
      res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
      return;
    }

    const cart = await this.cartService.findWithItems(cartId);
    res.json({
      success: true,
      data: cart,
    });
  }

  async clearCart(req: Request, res: Response): Promise<void> {
    const { cartId } = req.params;

    await this.cartItemService.clearCart(cartId);
    const cart = await this.cartService.findWithItems(cartId);
    res.json({
      success: true,
      data: cart,
    });
  }
}
