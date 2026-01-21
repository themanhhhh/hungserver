import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const orderController = new OrderController();

router.get('/', asyncHandler((req, res) => orderController.findAll(req, res)));
router.get('/:id', asyncHandler((req, res) => orderController.findById(req, res)));
router.get('/number/:orderNumber', asyncHandler((req, res) => orderController.findByOrderNumber(req, res)));
router.get('/user/:userId', asyncHandler((req, res) => orderController.findByUser(req, res)));
router.post('/', asyncHandler((req, res) => orderController.createOrder(req, res)));
router.put('/:id', asyncHandler((req, res) => orderController.update(req, res)));
router.delete('/:id', asyncHandler((req, res) => orderController.delete(req, res)));

export default router;
