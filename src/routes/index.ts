import { Router } from 'express';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import cartRoutes from './cart.routes';
import addressRoutes from './address.routes';
import reviewRoutes from './review.routes';
import campaignRoutes from './campaign.routes';
import flashSaleRoutes from './flash-sale.routes';
import seedRoutes from './seed.routes';

const router = Router();

// API v1 routes
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/carts', cartRoutes);
router.use('/addresses', addressRoutes);
router.use('/reviews', reviewRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/flash-sales', flashSaleRoutes);
router.use('/seed', seedRoutes);

export default router;

