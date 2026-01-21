export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum ProductBadge {
  NEW = 'new',
  BESTSELLER = 'bestseller',
  SALE = 'sale',
  NONE = 'none',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}
