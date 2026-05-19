import 'reflect-metadata';
import { In } from 'typeorm';
import { AppDataSource } from './data-source';
import { Address } from './entities/Address';
import { Brand } from './entities/Brand';
import { Campaign, CampaignStatus, CampaignType } from './entities/Campaign';
import { Category } from './entities/Category';
import { Collection } from './entities/Collection';
import { Order } from './entities/Order';
import { OrderItem } from './entities/OrderItem';
import { Post, PostStatus } from './entities/Post';
import { Product } from './entities/Product';
import { ProductImage } from './entities/ProductImage';
import { Review } from './entities/Review';
import { Shipment } from './entities/Shipment';
import { User } from './entities/User';
import {
  CarrierService,
  DiscountType,
  OrderStatus,
  PaymentStatus,
  ProductBadge,
  ShipmentStatus,
  ShippingMethod,
  UserRole,
} from './enums';

const passwordHash = '$2a$10$QWWPdNlZZ6CNhOqjKg5fZuHLZqVjXdGxRH7VfKfKpqPZk.hEqgBi.';
const seedBatch = process.env.SEED_BATCH || new Date().toISOString().replace(/\D/g, '').slice(0, 14);

function demoSlug(value: string): string {
  return `demo-${seedBatch}-${value}`;
}

function demoSku(value: string): string {
  return `DEMO-${seedBatch}-${value}`;
}

async function getOrCreateCategory(name: string, slug: string): Promise<Category> {
  const repo = AppDataSource.getRepository(Category);
  const existing = await repo.findOne({ where: { slug } });
  if (existing) return existing;

  return repo.save({ name, slug, is_active: true });
}

async function getOrCreateBrand(name: string, slug: string, country: string): Promise<Brand> {
  const repo = AppDataSource.getRepository(Brand);
  const existing = await repo.findOne({ where: { slug } });
  if (existing) return existing;

  return repo.save({ name, slug, country, logo_url: `/brands/${slug}.png` });
}

async function getOrCreateUser(data: Pick<User, 'email' | 'name' | 'phone'>): Promise<User> {
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) return existing;

  return repo.save({ ...data, password_hash: passwordHash, role: UserRole.CUSTOMER, is_active: true });
}

async function seedDemoData() {
  await AppDataSource.initialize();

  try {
    const productRepo = AppDataSource.getRepository(Product);
    const imageRepo = AppDataSource.getRepository(ProductImage);
    const addressRepo = AppDataSource.getRepository(Address);
    const reviewRepo = AppDataSource.getRepository(Review);
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const collectionRepo = AppDataSource.getRepository(Collection);
    const orderRepo = AppDataSource.getRepository(Order);
    const orderItemRepo = AppDataSource.getRepository(OrderItem);
    const shipmentRepo = AppDataSource.getRepository(Shipment);
    const postRepo = AppDataSource.getRepository(Post);
    const userRepo = AppDataSource.getRepository(User);

    const racket = await getOrCreateCategory('Vợt cầu lông', 'vot-cau-long');
    const shoes = await getOrCreateCategory('Giày cầu lông', 'giay-cau-long');
    const clothes = await getOrCreateCategory('Quần áo cầu lông', 'quan-ao-cau-long');
    const accessories = await getOrCreateCategory('Phụ kiện', 'phu-kien');
    const bags = await getOrCreateCategory('Túi đựng vợt', 'tui-dung-vot');

    const yonex = await getOrCreateBrand('Yonex', 'yonex', 'Japan');
    const victor = await getOrCreateBrand('Victor', 'victor', 'Taiwan');
    const lining = await getOrCreateBrand('Lining', 'lining', 'China');
    const mizuno = await getOrCreateBrand('Mizuno', 'mizuno', 'Japan');

    const productData: Array<Partial<Product>> = [
      { name: `Yonex Astrox 88D Pro 2026 ${seedBatch}`, slug: demoSlug('yonex-astrox-88d-pro-2026'), sku: demoSku('AX88D-PRO-26'), price: 4290000, original_price: 4890000, category_id: racket.id, brand_id: yonex.id, stock_quantity: 36, badge: ProductBadge.NEW, rating: 4.9, is_active: true },
      { name: `Yonex Astrox 77 Tour ${seedBatch}`, slug: demoSlug('yonex-astrox-77-tour'), sku: demoSku('AX77-TOUR'), price: 2890000, original_price: 3290000, category_id: racket.id, brand_id: yonex.id, stock_quantity: 42, badge: ProductBadge.SALE, rating: 4.7, is_active: true },
      { name: `Victor Ryuga Metallic C ${seedBatch}`, slug: demoSlug('victor-ryuga-metallic-c'), sku: demoSku('RYUGA-MC'), price: 3950000, original_price: 4450000, category_id: racket.id, brand_id: victor.id, stock_quantity: 18, badge: ProductBadge.BESTSELLER, rating: 4.8, is_active: true },
      { name: `Lining Axforce 90 Dragon Max ${seedBatch}`, slug: demoSlug('lining-axforce-90-dragon-max'), sku: demoSku('AXF90-DM'), price: 4590000, original_price: 5100000, category_id: racket.id, brand_id: lining.id, stock_quantity: 20, badge: ProductBadge.NEW, rating: 4.8, is_active: true },
      { name: `Mizuno Fortius 11 Power ${seedBatch}`, slug: demoSlug('mizuno-fortius-11-power'), sku: demoSku('FORTIUS11P'), price: 3390000, category_id: racket.id, brand_id: mizuno.id, stock_quantity: 24, badge: ProductBadge.NONE, rating: 4.5, is_active: true },
      { name: `Yonex Power Cushion 88 Dial 3 ${seedBatch}`, slug: demoSlug('yonex-power-cushion-88-dial-3'), sku: demoSku('PC88D3'), price: 3450000, category_id: shoes.id, brand_id: yonex.id, stock_quantity: 34, badge: ProductBadge.NEW, rating: 4.7, is_active: true },
      { name: `Victor P9200TTY ${seedBatch}`, slug: demoSlug('victor-p9200tty'), sku: demoSku('P9200TTY'), price: 3190000, original_price: 3690000, category_id: shoes.id, brand_id: victor.id, stock_quantity: 28, badge: ProductBadge.SALE, rating: 4.6, is_active: true },
      { name: `Lining Saga Lite 5 ${seedBatch}`, slug: demoSlug('lining-saga-lite-5'), sku: demoSku('SAGA-LITE5'), price: 1850000, category_id: shoes.id, brand_id: lining.id, stock_quantity: 50, badge: ProductBadge.BESTSELLER, rating: 4.5, is_active: true },
      { name: `Yonex Tournament Polo Navy ${seedBatch}`, slug: demoSlug('yonex-tournament-polo-navy'), sku: demoSku('POLO-NAVY'), price: 790000, category_id: clothes.id, brand_id: yonex.id, stock_quantity: 90, badge: ProductBadge.NEW, rating: 4.4, is_active: true },
      { name: `Victor Training Shorts Black ${seedBatch}`, slug: demoSlug('victor-training-shorts-black'), sku: demoSku('SHORT-BLK'), price: 520000, original_price: 650000, category_id: clothes.id, brand_id: victor.id, stock_quantity: 110, badge: ProductBadge.SALE, rating: 4.3, is_active: true },
      { name: `Yonex Exbolt 65 White ${seedBatch}`, slug: demoSlug('yonex-exbolt-65-white'), sku: demoSku('EXBOLT65-W'), price: 185000, category_id: accessories.id, brand_id: yonex.id, stock_quantity: 280, badge: ProductBadge.BESTSELLER, rating: 4.8, is_active: true },
      { name: `Victor Doublethermo BR9213 ${seedBatch}`, slug: demoSlug('victor-doublethermo-br9213'), sku: demoSku('BR9213'), price: 1590000, original_price: 1890000, category_id: bags.id, brand_id: victor.id, stock_quantity: 32, badge: ProductBadge.SALE, rating: 4.6, is_active: true },
    ];

    const products: Product[] = [];
    for (const data of productData) {
      let product = await productRepo.findOne({ where: { slug: data.slug } });
      if (!product) {
        product = await productRepo.save(data);
      }
      products.push(product);
    }

    for (const product of products) {
      const imageCount = await imageRepo.count({ where: { product_id: product.id } });
      if (imageCount === 0) {
        await imageRepo.save([
          { product_id: product.id, image_url: `/products/${product.slug}-1.jpg`, is_primary: true, display_order: 0 },
          { product_id: product.id, image_url: `/products/${product.slug}-2.jpg`, is_primary: false, display_order: 1 },
        ]);
      }
    }

    const customers = await Promise.all([
      getOrCreateUser({ email: `demo.${seedBatch}.minh.anh@gmail.com`, name: `Đặng Minh Anh ${seedBatch}`, phone: '0961000001' }),
      getOrCreateUser({ email: `demo.${seedBatch}.quoc.huy@gmail.com`, name: `Ngô Quốc Huy ${seedBatch}`, phone: '0961000002' }),
      getOrCreateUser({ email: `demo.${seedBatch}.thao.nguyen@gmail.com`, name: `Nguyễn Phương Thảo ${seedBatch}`, phone: '0961000003' }),
    ]);

    for (const user of customers) {
      const addressCount = await addressRepo.count({ where: { user_id: user.id } });
      if (addressCount === 0) {
        await addressRepo.save({ user_id: user.id, name: 'Nhà riêng', phone: user.phone, street: '88 Nguyễn Trãi, Thanh Xuân', city: 'Hà Nội', is_default: true });
      }
    }

    const reviewPairs = [
      [customers[0], products[0], 5, 'Vợt đầm tay, phản tạt nhanh, rất hợp đánh đôi công.'],
      [customers[1], products[2], 5, 'Hoàn thiện đẹp, căng lưới lên đánh rất nảy.'],
      [customers[2], products[5], 4, 'Giày ôm chân, bám sân tốt, đi vài buổi là quen.'],
      [customers[0], products[10], 5, 'Cước nổ tốt, giữ tension ổn so với tầm giá.'],
    ] as const;

    for (const [user, product, rating, comment] of reviewPairs) {
      const exists = await reviewRepo.findOne({ where: { user_id: user.id, product_id: product.id } });
      if (!exists) {
        await reviewRepo.save({ user_id: user.id, product_id: product.id, rating, comment });
      }
    }

    const now = new Date();
    const campaignCode = `DEMO20-${seedBatch}`;
    const campaign = await campaignRepo.findOne({ where: { code: campaignCode }, relations: ['products'] }) || campaignRepo.create({
      name: `Demo giảm 20% vợt cao cấp ${seedBatch}`,
      title: 'Nâng cấp vợt thi đấu',
      code: campaignCode,
      description: 'Ưu đãi demo cho nhóm sản phẩm vợt cầu lông cao cấp.',
      type: CampaignType.PROMOTION,
      status: CampaignStatus.ACTIVE,
      discount_type: DiscountType.PERCENTAGE,
      discount_value: 20,
      start_date: now,
      end_date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      image_url: '/campaigns/demo-racket-sale.jpg',
      display_order: 1,
      show_on_homepage: true,
    });
    campaign.products = products.slice(0, 5);
    await campaignRepo.save(campaign);

    const collectionSlug = demoSlug('pro-player-picks');
    let collection = await collectionRepo.findOne({ where: { slug: collectionSlug } });
    if (!collection) {
      collection = await collectionRepo.save({
        name: `Pro Player Picks ${seedBatch}`,
        slug: collectionSlug,
        country: 'International',
        sport: 'Badminton',
        achievement: 'Tournament-ready selection',
        description: 'Bộ sản phẩm demo dành cho người chơi phong trào muốn nâng cấp lên cấu hình thi đấu.',
        thumbnail: '/collections/demo-pro-player-picks.jpg',
        is_active: true,
      });
    }
    for (const product of products.slice(0, 6)) {
      const productWithCollections = await productRepo.findOne({ where: { id: product.id }, relations: ['collections'] });
      if (productWithCollections && !productWithCollections.collections?.some((item) => item.id === collection.id)) {
        productWithCollections.collections = [...(productWithCollections.collections || []), collection];
        await productRepo.save(productWithCollections);
      }
    }

    const orderSpecs = [
      { number: `DEMO-${seedBatch}-0001`, user: customers[0], status: OrderStatus.DELIVERED, payment: PaymentStatus.PAID, items: [[products[0], 1], [products[10], 2]] as const },
      { number: `DEMO-${seedBatch}-0002`, user: customers[1], status: OrderStatus.IN_TRANSIT, payment: PaymentStatus.PAID, items: [[products[2], 1], [products[6], 1]] as const },
      { number: `DEMO-${seedBatch}-0003`, user: customers[2], status: OrderStatus.PENDING_PAYMENT, payment: PaymentStatus.PENDING, items: [[products[5], 1], [products[8], 1]] as const },
    ];

    for (const spec of orderSpecs) {
      let order = await orderRepo.findOne({ where: { order_number: spec.number } });
      if (!order) {
        const total = spec.items.reduce((sum, [product, quantity]) => sum + Number(product.price) * quantity, 0);
        const savedOrder = await orderRepo.save({ order_number: spec.number, user_id: spec.user.id, campaign_id: campaign.id, total, status: spec.status, payment_status: spec.payment, is_verified: spec.payment === PaymentStatus.PAID });
        await orderItemRepo.save(spec.items.map(([product, quantity]) => ({ order_id: savedOrder.id, product_id: product.id, price: product.price, quantity })));
        order = savedOrder;
      }

      const shipmentCount = await shipmentRepo.count({ where: { order_id: order.id } });
      if (shipmentCount === 0 && spec.status !== OrderStatus.PENDING_PAYMENT) {
        await shipmentRepo.save({
          order_id: order.id,
          tracking_number: `DEMO${spec.number.replace(/\D/g, '')}`,
          carrier: 'GHN',
          carrier_service: CarrierService.EXPRESS,
          shipping_method: ShippingMethod.SELLER_FULFILLMENT,
          status: spec.status === OrderStatus.DELIVERED ? ShipmentStatus.DELIVERED : ShipmentStatus.IN_TRANSIT,
          pickup_address: 'BadShop Warehouse, Quận 7, TP. Hồ Chí Minh',
          pickup_name: 'BadShop Fulfillment',
          pickup_phone: '0909000000',
          delivery_address: '88 Nguyễn Trãi, Thanh Xuân, Hà Nội',
          delivery_name: spec.user.name,
          delivery_phone: spec.user.phone,
          estimated_delivery: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          shipping_fee: 30000,
          weight: 1.2,
          package_dimension: '70x25x15',
          tracking_history: JSON.stringify([{ status: 'picked_up', note: 'Đã lấy hàng', timestamp: now.toISOString() }]),
        });
      }
    }

    const admin = await userRepo.findOne({ where: { role: UserRole.ADMIN } });
    const posts = [
      {
        title: `Cách chọn vợt cầu lông theo lối đánh ${seedBatch}`,
        slug: demoSlug('cach-chon-vot-cau-long-theo-loi-danh'),
        excerpt: 'Gợi ý nhanh để chọn vợt công, thủ hoặc cân bằng dựa trên trọng lượng, điểm cân bằng và độ cứng thân vợt.',
        content: '<p>Người chơi thiên công nên ưu tiên vợt nặng đầu, thân cứng. Người chơi phản tạt có thể chọn vợt cân bằng hoặc nhẹ đầu để tăng tốc độ xử lý.</p>',
      },
      {
        title: `Checklist bảo quản giày cầu lông sau mỗi trận ${seedBatch}`,
        slug: demoSlug('checklist-bao-quan-giay-cau-long'),
        excerpt: 'Các bước đơn giản giúp giày bền form, hạn chế mùi và giữ độ bám sân lâu hơn.',
        content: '<p>Luôn tháo lót giày để hong khô, tránh phơi trực tiếp dưới nắng gắt và vệ sinh đế sau khi chơi.</p>',
      },
    ];

    for (const post of posts) {
      const exists = await postRepo.findOne({ where: { slug: post.slug } });
      if (!exists) {
        await postRepo.save({ ...post, featured_image: `/posts/${post.slug}.jpg`, status: PostStatus.PUBLISHED, view_count: 120, author_id: admin?.id });
      }
    }

    const counts = {
      products: await productRepo.count({ where: { slug: In(productData.map((item) => item.slug as string)) } }),
      users: customers.length,
      campaign: 1,
      orders: orderSpecs.length,
      posts: posts.length,
    };

    console.log('Demo data generated successfully');
    console.log(JSON.stringify(counts, null, 2));
  } finally {
    await AppDataSource.destroy();
  }
}

seedDemoData().catch((error) => {
  console.error('Failed to generate demo data:', error);
  process.exit(1);
});
