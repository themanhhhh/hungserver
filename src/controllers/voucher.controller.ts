import { Request, Response } from 'express';
import { VoucherDiscountType, VoucherScopeType, VoucherStatus } from '../entities/Voucher';
import { VoucherService } from '../services/voucher.service';

export class VoucherController {
  private voucherService = new VoucherService();

  async findAll(req: Request, res: Response): Promise<void> {
    const vouchers = await this.voucherService.findAll({
      q: req.query.q as string | undefined,
      status: req.query.status as VoucherStatus | undefined,
      discount_type: req.query.discount_type as VoucherDiscountType | undefined,
      scope_type: req.query.scope_type as VoucherScopeType | undefined,
    });
    res.json({ success: true, data: vouchers });
  }

  async findAvailable(req: Request, res: Response): Promise<void> {
    const vouchers = await this.voucherService.findAvailable();
    res.json({ success: true, data: vouchers });
  }

  async findById(req: Request, res: Response): Promise<void> {
    const voucher = await this.voucherService.findById(req.params.id);
    if (!voucher) {
      res.status(404).json({ success: false, error: { message: 'Không tìm thấy voucher' } });
      return;
    }
    res.json({ success: true, data: voucher });
  }

  async findByCode(req: Request, res: Response): Promise<void> {
    const voucher = await this.voucherService.findByCode(req.params.code);
    if (!voucher) {
      res.status(404).json({ success: false, error: { message: 'Không tìm thấy voucher' } });
      return;
    }
    res.json({ success: true, data: voucher });
  }

  async create(req: Request, res: Response): Promise<void> {
    const voucher = await this.voucherService.create(req.body);
    res.status(201).json({ success: true, data: voucher });
  }

  async validate(req: Request, res: Response): Promise<void> {
    const authUser = (req as any).user;
    const result = await this.voucherService.validateVoucher({
      ...req.body,
      userId: authUser?.id || req.body.userId || req.body.user_id,
    });
    res.status(result.valid ? 200 : 400).json({ success: result.valid, data: result, error: result.valid ? undefined : { message: result.message } });
  }

  async update(req: Request, res: Response): Promise<void> {
    const voucher = await this.voucherService.update(req.params.id, req.body);
    res.json({ success: true, data: voucher });
  }

  async activate(req: Request, res: Response): Promise<void> {
    const voucher = await this.voucherService.activate(req.params.id);
    res.json({ success: true, data: voucher });
  }

  async deactivate(req: Request, res: Response): Promise<void> {
    const voucher = await this.voucherService.deactivate(req.params.id);
    res.json({ success: true, data: voucher });
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.voucherService.delete(req.params.id);
    res.json({ success: true, message: 'Đã xóa voucher' });
  }
}
