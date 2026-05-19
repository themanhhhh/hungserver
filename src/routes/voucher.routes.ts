import { Router } from 'express';
import { VoucherController } from '../controllers/voucher.controller';
import { asyncHandler } from '../middlewares/async.middleware';

const router = Router();
const voucherController = new VoucherController();

router.get('/', asyncHandler((req, res) => voucherController.findAll(req, res)));
router.get('/available', asyncHandler((req, res) => voucherController.findAvailable(req, res)));
router.post('/validate', asyncHandler((req, res) => voucherController.validate(req, res)));
router.get('/code/:code', asyncHandler((req, res) => voucherController.findByCode(req, res)));
router.get('/:id', asyncHandler((req, res) => voucherController.findById(req, res)));
router.post('/', asyncHandler((req, res) => voucherController.create(req, res)));
router.put('/:id', asyncHandler((req, res) => voucherController.update(req, res)));
router.post('/:id/activate', asyncHandler((req, res) => voucherController.activate(req, res)));
router.post('/:id/deactivate', asyncHandler((req, res) => voucherController.deactivate(req, res)));
router.delete('/:id', asyncHandler((req, res) => voucherController.delete(req, res)));

export default router;
