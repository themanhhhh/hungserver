import { In, Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AppError } from '../middlewares/error.middleware';
import { Brand } from '../entities/Brand';
import { Category } from '../entities/Category';
import { Order } from '../entities/Order';
import { Product } from '../entities/Product';
import {
  Voucher,
  VoucherDiscountType,
  VoucherScopeType,
  VoucherStatus,
} from '../entities/Voucher';

type VoucherPayload = Partial<Voucher> & {
  productIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
};

type VoucherFilters = {
  q?: string;
  status?: VoucherStatus;
  discount_type?: VoucherDiscountType;
  scope_type?: VoucherScopeType;
};

export type VoucherCartItem = {
  productId?: string;
  product_id?: string;
  price: number | string;
  quantity: number | string;
};

export type VoucherValidationInput = {
  code?: string;
  voucherId?: string;
  userId?: string;
  items: VoucherCartItem[];
  subtotal: number;
  shippingFee: number;
};

export type VoucherValidationResult = {
  valid: boolean;
  message: string;
  voucher?: Voucher;
  discountAmount: number;
  shippingDiscount: number;
  finalTotal: number;
};

export class VoucherService {
  private voucherRepository: Repository<Voucher>;

  constructor() {
    this.voucherRepository = AppDataSource.getRepository(Voucher);
  }

  async findAll(filters: VoucherFilters = {}): Promise<Voucher[]> {
    const query = this.voucherRepository
      .createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.products', 'products')
      .leftJoinAndSelect('voucher.categories', 'categories')
      .leftJoinAndSelect('voucher.brands', 'brands')
      .where('voucher.is_delete = false')
      .orderBy('voucher.created_at', 'DESC');

    if (filters.q) {
      query.andWhere('(voucher.name ILIKE :q OR voucher.code ILIKE :q)', { q: `%${filters.q}%` });
    }
    if (filters.status) {
      query.andWhere('voucher.status = :status', { status: filters.status });
    }
    if (filters.discount_type) {
      query.andWhere('voucher.discount_type = :discount_type', { discount_type: filters.discount_type });
    }
    if (filters.scope_type) {
      query.andWhere('voucher.scope_type = :scope_type', { scope_type: filters.scope_type });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Voucher | null> {
    return this.voucherRepository.findOne({
      where: { id, is_delete: false },
      relations: ['products', 'categories', 'brands'],
    });
  }

  async findByCode(code: string): Promise<Voucher | null> {
    return this.voucherRepository.findOne({
      where: { code: this.normalizeCode(code), is_delete: false },
      relations: ['products', 'categories', 'brands'],
    });
  }

  async findAvailable(): Promise<Voucher[]> {
    const now = new Date();
    return this.voucherRepository
      .createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.products', 'products')
      .leftJoinAndSelect('voucher.categories', 'categories')
      .leftJoinAndSelect('voucher.brands', 'brands')
      .where('voucher.is_delete = false')
      .andWhere('voucher.is_public = true')
      .andWhere('voucher.status = :status', { status: VoucherStatus.ACTIVE })
      .andWhere('voucher.start_date <= :now AND voucher.end_date >= :now', { now })
      .andWhere('(voucher.total_usage_limit IS NULL OR voucher.usage_count < voucher.total_usage_limit)')
      .orderBy('voucher.created_at', 'DESC')
      .getMany();
  }

  async validateVoucher(input: VoucherValidationInput): Promise<VoucherValidationResult> {
    const voucher = input.voucherId
      ? await this.findById(input.voucherId)
      : input.code
      ? await this.findByCode(input.code)
      : null;

    if (!voucher) {
      return this.invalidResult(input, 'Voucher không tồn tại');
    }

    const basicValidationMessage = await this.getBasicValidationError(voucher, input.userId);
    if (basicValidationMessage) {
      return this.invalidResult(input, basicValidationMessage, voucher);
    }

    if (Number(input.subtotal || 0) < Number(voucher.minimum_spend || 0)) {
      return this.invalidResult(input, `Đơn hàng chưa đạt tối thiểu ${Number(voucher.minimum_spend).toLocaleString('vi-VN')}đ`, voucher);
    }

    const eligibleSubtotal = await this.calculateEligibleSubtotal(voucher, input.items);
    if (voucher.discount_type !== VoucherDiscountType.FREE_SHIPPING && eligibleSubtotal <= 0) {
      return this.invalidResult(input, 'Giỏ hàng không có sản phẩm phù hợp với voucher', voucher);
    }

    const discountAmount = this.calculateDiscountAmount(voucher, eligibleSubtotal, input.subtotal);
    const shippingDiscount = this.calculateShippingDiscount(voucher, input.shippingFee);
    const finalTotal = Math.max(0, Number(input.subtotal || 0) + Number(input.shippingFee || 0) - discountAmount - shippingDiscount);

    return {
      valid: true,
      message: 'Voucher hợp lệ',
      voucher,
      discountAmount,
      shippingDiscount,
      finalTotal,
    };
  }

  async deductUsage(voucherId: string): Promise<void> {
    await this.voucherRepository.increment({ id: voucherId }, 'usage_count', 1);
  }

  async create(data: VoucherPayload): Promise<Voucher> {
    this.validatePayload(data);

    const code = this.normalizeCode(data.code || '');
    const existing = await this.voucherRepository.findOne({ where: { code, is_delete: false } });
    if (existing) {
      throw new AppError('Mã voucher đã tồn tại', 400);
    }

    const voucher = this.voucherRepository.create(this.toVoucherData(data, code));
    await this.assignScopes(voucher, data);
    return this.voucherRepository.save(voucher);
  }

  async update(id: string, data: VoucherPayload): Promise<Voucher> {
    const voucher = await this.findById(id);
    if (!voucher) {
      throw new AppError('Không tìm thấy voucher', 404);
    }

    this.validatePayload({ ...voucher, ...data });

    const code = data.code ? this.normalizeCode(data.code) : voucher.code;
    if (code !== voucher.code) {
      const existing = await this.voucherRepository.findOne({ where: { code, is_delete: false } });
      if (existing && existing.id !== id) {
        throw new AppError('Mã voucher đã tồn tại', 400);
      }
    }

    Object.assign(voucher, this.toVoucherData(data, code));
    await this.assignScopes(voucher, data);
    return this.voucherRepository.save(voucher);
  }

  async activate(id: string): Promise<Voucher> {
    const voucher = await this.findById(id);
    if (!voucher) {
      throw new AppError('Không tìm thấy voucher', 404);
    }
    if (voucher.status === VoucherStatus.ACTIVE) {
      throw new AppError('Voucher đã được kích hoạt', 400);
    }

    this.validatePayload(voucher);
    voucher.status = VoucherStatus.ACTIVE;
    return this.voucherRepository.save(voucher);
  }

  async deactivate(id: string): Promise<Voucher> {
    const voucher = await this.findById(id);
    if (!voucher) {
      throw new AppError('Không tìm thấy voucher', 404);
    }
    if (voucher.status !== VoucherStatus.ACTIVE) {
      throw new AppError('Chỉ voucher đang active mới có thể vô hiệu hóa', 400);
    }

    voucher.status = VoucherStatus.INACTIVE;
    return this.voucherRepository.save(voucher);
  }

  async delete(id: string): Promise<void> {
    const voucher = await this.findById(id);
    if (!voucher) {
      throw new AppError('Không tìm thấy voucher', 404);
    }
    if (voucher.status === VoucherStatus.ACTIVE) {
      throw new AppError('Vui lòng vô hiệu hóa voucher trước khi xóa', 400);
    }
    if (voucher.usage_count > 0) {
      throw new AppError('Voucher đã phát sinh sử dụng, không thể xóa', 400);
    }

    voucher.is_delete = true;
    await this.voucherRepository.save(voucher);
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private invalidResult(input: VoucherValidationInput, message: string, voucher?: Voucher): VoucherValidationResult {
    return {
      valid: false,
      message,
      voucher,
      discountAmount: 0,
      shippingDiscount: 0,
      finalTotal: Number(input.subtotal || 0) + Number(input.shippingFee || 0),
    };
  }

  private async getBasicValidationError(voucher: Voucher, userId?: string): Promise<string | null> {
    const now = new Date();
    if (voucher.status !== VoucherStatus.ACTIVE) {
      return 'Voucher chưa được kích hoạt';
    }
    if (now < new Date(voucher.start_date)) {
      return 'Voucher chưa đến thời gian sử dụng';
    }
    if (now > new Date(voucher.end_date)) {
      return 'Voucher đã hết hạn';
    }
    if (voucher.total_usage_limit && voucher.usage_count >= voucher.total_usage_limit) {
      return 'Voucher đã hết lượt sử dụng';
    }
    if (userId && voucher.per_user_usage_limit) {
      const usedCount = await AppDataSource.getRepository(Order).count({
        where: { user_id: userId, voucher_id: voucher.id, is_delete: false },
      });
      if (usedCount >= voucher.per_user_usage_limit) {
        return 'Bạn đã dùng hết lượt cho voucher này';
      }
    }

    return null;
  }

  private async calculateEligibleSubtotal(voucher: Voucher, items: VoucherCartItem[]): Promise<number> {
    if (voucher.discount_type === VoucherDiscountType.FREE_SHIPPING) {
      return 0;
    }
    if (voucher.scope_type === VoucherScopeType.ALL) {
      return this.calculateItemsSubtotal(items);
    }

    const productIds = items.map((item) => item.productId || item.product_id).filter(Boolean) as string[];
    if (!productIds.length) return 0;

    const products = await AppDataSource.getRepository(Product).find({ where: { id: In(productIds), is_delete: false } });
    const productMap = new Map(products.map((product) => [product.id, product]));
    const scopedIds = new Set(this.getScopedEntityIds(voucher));

    return items.reduce((sum, item) => {
      const productId = item.productId || item.product_id;
      if (!productId) return sum;
      const product = productMap.get(productId);
      if (!product || !this.isProductInVoucherScope(voucher, product, scopedIds)) return sum;

      return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }

  private calculateItemsSubtotal(items: VoucherCartItem[]): number {
    return items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }

  private getScopedEntityIds(voucher: Voucher): string[] {
    if (voucher.scope_type === VoucherScopeType.PRODUCT) return voucher.products?.map((product) => product.id) || [];
    if (voucher.scope_type === VoucherScopeType.CATEGORY) return voucher.categories?.map((category) => category.id) || [];
    if (voucher.scope_type === VoucherScopeType.BRAND) return voucher.brands?.map((brand) => brand.id) || [];
    return [];
  }

  private isProductInVoucherScope(voucher: Voucher, product: Product, scopedIds: Set<string>): boolean {
    if (voucher.scope_type === VoucherScopeType.PRODUCT) return scopedIds.has(product.id);
    if (voucher.scope_type === VoucherScopeType.CATEGORY) return scopedIds.has(product.category_id);
    if (voucher.scope_type === VoucherScopeType.BRAND) return scopedIds.has(product.brand_id);
    return true;
  }

  private calculateDiscountAmount(voucher: Voucher, eligibleSubtotal: number, cartSubtotal: number): number {
    if (voucher.discount_type === VoucherDiscountType.FREE_SHIPPING) return 0;

    const rawDiscount = voucher.discount_type === VoucherDiscountType.PERCENTAGE
      ? eligibleSubtotal * (Number(voucher.discount_value || 0) / 100)
      : Number(voucher.discount_value || 0);
    const cappedByMax = voucher.max_discount_amount ? Math.min(rawDiscount, Number(voucher.max_discount_amount)) : rawDiscount;
    return Math.max(0, Math.min(cappedByMax, Number(cartSubtotal || 0)));
  }

  private calculateShippingDiscount(voucher: Voucher, shippingFee: number): number {
    if (voucher.discount_type !== VoucherDiscountType.FREE_SHIPPING) return 0;

    const maxShippingDiscount = voucher.max_discount_amount ? Number(voucher.max_discount_amount) : Number(shippingFee || 0);
    return Math.max(0, Math.min(Number(shippingFee || 0), maxShippingDiscount));
  }

  private toVoucherData(data: VoucherPayload, code: string): Partial<Voucher> {
    const voucherData: Partial<Voucher> = {};
    const fields: Array<keyof Voucher> = [
      'name',
      'description',
      'status',
      'discount_type',
      'discount_value',
      'max_discount_amount',
      'minimum_spend',
      'total_usage_limit',
      'per_user_usage_limit',
      'start_date',
      'end_date',
      'scope_type',
      'is_stackable',
      'is_public',
    ];

    fields.forEach((field) => {
      if (data[field] !== undefined) {
        (voucherData as any)[field] = data[field];
      }
    });
    voucherData.code = code;

    return voucherData;
  }

  private validatePayload(data: VoucherPayload): void {
    if (!data.name?.trim()) {
      throw new AppError('Tên voucher là bắt buộc', 400);
    }
    if (!data.code?.trim()) {
      throw new AppError('Mã voucher là bắt buộc', 400);
    }
    if (!data.discount_type) {
      throw new AppError('Loại giảm giá là bắt buộc', 400);
    }
    if (Number(data.discount_value || 0) <= 0 && data.discount_type !== VoucherDiscountType.FREE_SHIPPING) {
      throw new AppError('Giá trị giảm giá phải lớn hơn 0', 400);
    }
    if (data.discount_type === VoucherDiscountType.PERCENTAGE && Number(data.discount_value) > 100) {
      throw new AppError('Giảm giá phần trăm không được vượt quá 100%', 400);
    }
    if (Number(data.minimum_spend || 0) < 0) {
      throw new AppError('Giá trị đơn tối thiểu không được âm', 400);
    }
    if (data.total_usage_limit !== null && data.total_usage_limit !== undefined && Number(data.total_usage_limit) <= 0) {
      throw new AppError('Tổng lượt sử dụng phải lớn hơn 0', 400);
    }
    if (data.per_user_usage_limit !== null && data.per_user_usage_limit !== undefined && Number(data.per_user_usage_limit) <= 0) {
      throw new AppError('Lượt sử dụng mỗi khách phải lớn hơn 0', 400);
    }

    const startDate = new Date(data.start_date || '');
    const endDate = new Date(data.end_date || '');
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new AppError('Thời gian hiệu lực voucher không hợp lệ', 400);
    }
    if (endDate <= startDate) {
      throw new AppError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu', 400);
    }
  }

  private async assignScopes(voucher: Voucher, data: VoucherPayload): Promise<void> {
    if (data.productIds !== undefined) {
      voucher.products = await this.findScopeEntities(Product, data.productIds);
    }
    if (data.categoryIds !== undefined) {
      voucher.categories = await this.findScopeEntities(Category, data.categoryIds);
    }
    if (data.brandIds !== undefined) {
      voucher.brands = await this.findScopeEntities(Brand, data.brandIds);
    }
  }

  private async findScopeEntities<T extends { id: string }>(entity: new () => T, ids: string[]): Promise<T[]> {
    if (!ids.length) return [];
    const repository = AppDataSource.getRepository(entity);
    const rows = await repository.find({ where: { id: In(ids) } as any });
    if (rows.length !== ids.length) {
      throw new AppError('Phạm vi áp dụng voucher không hợp lệ', 400);
    }
    return rows;
  }
}
