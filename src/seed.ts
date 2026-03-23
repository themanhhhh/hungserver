import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { Category } from './entities/Category';
import { Brand } from './entities/Brand';
import { Product } from './entities/Product';
import { User } from './entities/User';
import { Address } from './entities/Address';
import { ProductImage } from './entities/ProductImage';
import { Review } from './entities/Review';
import { Campaign } from './entities/Campaign';
import { FlashSale } from './entities/FlashSale';
import { FlashSaleProduct } from './entities/FlashSaleProduct';
import { Order } from './entities/Order';
import { OrderItem } from './entities/OrderItem';
import { ProductBadge, UserRole, DiscountType, OrderStatus, PaymentStatus } from './enums';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const categoryRepo = AppDataSource.getRepository(Category);
    const brandRepo = AppDataSource.getRepository(Brand);
    const productRepo = AppDataSource.getRepository(Product);
    const userRepo = AppDataSource.getRepository(User);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️ Clearing existing data...');
    
    // Clear in order respecting foreign key constraints
    const orderItemRepo = AppDataSource.getRepository(OrderItem);
    const orderRepo = AppDataSource.getRepository(Order);
    const reviewRepo = AppDataSource.getRepository(Review);
    const flashSaleProductRepo = AppDataSource.getRepository(FlashSaleProduct);
    const flashSaleRepo = AppDataSource.getRepository(FlashSale);
    const campaignRepo = AppDataSource.getRepository(Campaign);
    const productImageRepo = AppDataSource.getRepository(ProductImage);
    const addressRepo = AppDataSource.getRepository(Address);
    
    await orderItemRepo.createQueryBuilder().delete().from(OrderItem).execute();
    await orderRepo.createQueryBuilder().delete().from(Order).execute();
    await reviewRepo.createQueryBuilder().delete().from(Review).execute();
    await flashSaleProductRepo.createQueryBuilder().delete().from(FlashSaleProduct).execute();
    await flashSaleRepo.createQueryBuilder().delete().from(FlashSale).execute();
    await campaignRepo.createQueryBuilder().delete().from(Campaign).execute();
    await productImageRepo.createQueryBuilder().delete().from(ProductImage).execute();
    await addressRepo.createQueryBuilder().delete().from(Address).execute();
    await productRepo.createQueryBuilder().delete().from(Product).execute();
    await categoryRepo.createQueryBuilder().delete().from(Category).execute();
    await brandRepo.createQueryBuilder().delete().from(Brand).execute();
    await userRepo.createQueryBuilder().delete().from(User).execute();
    
    // ============================================
    // SEED CATEGORIES
    // ============================================
    console.log('📁 Seeding categories...');
    const categories = await categoryRepo.save([
      { name: 'Vợt cầu lông', slug: 'vot-cau-long', is_active: true },
      { name: 'Giày cầu lông', slug: 'giay-cau-long', is_active: true },
      { name: 'Quần áo cầu lông', slug: 'quan-ao-cau-long', is_active: true },
      { name: 'Phụ kiện', slug: 'phu-kien', is_active: true },
      { name: 'Túi đựng vợt', slug: 'tui-dung-vot', is_active: true },
      { name: 'Cầu lông', slug: 'cau-long', is_active: true },
    ]);

    const [catRacket, catShoes, catClothes, catAccessories, catBags, catShuttlecock] = categories;
    console.log(`✅ Created ${categories.length} categories`);

    // ============================================
    // SEED BRANDS
    // ============================================
    console.log('🏷️ Seeding brands...');
    const brands = await brandRepo.save([
      { name: 'Yonex', slug: 'yonex', country: 'Japan', logo_url: '/brands/yonex.png' },
      { name: 'Victor', slug: 'victor', country: 'Taiwan', logo_url: '/brands/victor.png' },
      { name: 'Lining', slug: 'lining', country: 'China', logo_url: '/brands/lining.png' },
      { name: 'Mizuno', slug: 'mizuno', country: 'Japan', logo_url: '/brands/mizuno.png' },
      { name: 'Kawasaki', slug: 'kawasaki', country: 'Japan', logo_url: '/brands/kawasaki.png' },
      { name: 'Apacs', slug: 'apacs', country: 'Malaysia', logo_url: '/brands/apacs.png' },
    ]);

    const [brandYonex, brandVictor, brandLining, brandMizuno, brandKawasaki, brandApacs] = brands;
    console.log(`✅ Created ${brands.length} brands`);

    // ============================================
    // SEED PRODUCTS
    // ============================================
    console.log('🏸 Seeding products...');
    const productsData: Partial<Product>[] = [
      // Yonex Rackets
      {
        name: 'Yonex Astrox 100 ZZ',
        slug: 'yonex-astrox-100-zz',
        sku: 'YNX-AX100ZZ',
        price: 4500000,
        original_price: 5200000,
        category_id: catRacket.id,
        brand_id: brandYonex.id,
        stock_quantity: 25,
        badge: ProductBadge.BESTSELLER,
        rating: 4.9,
        is_active: true,
      },
      {
        name: 'Yonex Nanoflare 800 Pro',
        slug: 'yonex-nanoflare-800-pro',
        sku: 'YNX-NF800P',
        price: 4200000,
        original_price: undefined,
        category_id: catRacket.id,
        brand_id: brandYonex.id,
        stock_quantity: 30,
        badge: ProductBadge.NEW,
        rating: 4.8,
        is_active: true,
      },
      {
        name: 'Yonex Arcsaber 11 Pro',
        slug: 'yonex-arcsaber-11-pro',
        sku: 'YNX-AS11P',
        price: 3800000,
        original_price: 4200000,
        category_id: catRacket.id,
        brand_id: brandYonex.id,
        stock_quantity: 20,
        badge: ProductBadge.SALE,
        rating: 4.7,
        is_active: true,
      },
      {
        name: 'Yonex Duora 10',
        slug: 'yonex-duora-10',
        sku: 'YNX-D10',
        price: 3500000,
        original_price: undefined,
        category_id: catRacket.id,
        brand_id: brandYonex.id,
        stock_quantity: 15,
        badge: ProductBadge.NONE,
        rating: 4.6,
        is_active: true,
      },
      // Victor Rackets
      {
        name: 'Victor Thruster K Falcon',
        slug: 'victor-thruster-k-falcon',
        sku: 'VCT-TKF',
        price: 3200000,
        original_price: 3800000,
        category_id: catRacket.id,
        brand_id: brandVictor.id,
        stock_quantity: 18,
        badge: ProductBadge.SALE,
        rating: 4.5,
        is_active: true,
      },
      {
        name: 'Victor Auraspeed 90K',
        slug: 'victor-auraspeed-90k',
        sku: 'VCT-AS90K',
        price: 4000000,
        original_price: undefined,
        category_id: catRacket.id,
        brand_id: brandVictor.id,
        stock_quantity: 22,
        badge: ProductBadge.NEW,
        rating: 4.7,
        is_active: true,
      },
      {
        name: 'Victor DriveX 9X',
        slug: 'victor-drivex-9x',
        sku: 'VCT-DX9X',
        price: 2800000,
        original_price: undefined,
        category_id: catRacket.id,
        brand_id: brandVictor.id,
        stock_quantity: 35,
        badge: ProductBadge.BESTSELLER,
        rating: 4.6,
        is_active: true,
      },
      // Lining Rackets
      {
        name: 'Lining Aeronaut 9000',
        slug: 'lining-aeronaut-9000',
        sku: 'LN-AN9000',
        price: 3600000,
        original_price: 4000000,
        category_id: catRacket.id,
        brand_id: brandLining.id,
        stock_quantity: 20,
        badge: ProductBadge.SALE,
        rating: 4.5,
        is_active: true,
      },
      {
        name: 'Lining N7 II Light',
        slug: 'lining-n7-ii-light',
        sku: 'LN-N7IIL',
        price: 2500000,
        original_price: undefined,
        category_id: catRacket.id,
        brand_id: brandLining.id,
        stock_quantity: 40,
        badge: ProductBadge.NONE,
        rating: 4.3,
        is_active: true,
      },
      // Shoes
      {
        name: 'Yonex Power Cushion 65 Z3',
        slug: 'yonex-power-cushion-65-z3',
        sku: 'YNX-PC65Z3',
        price: 3200000,
        original_price: undefined,
        category_id: catShoes.id,
        brand_id: brandYonex.id,
        stock_quantity: 50,
        badge: ProductBadge.BESTSELLER,
        rating: 4.8,
        is_active: true,
      },
      {
        name: 'Yonex Aerus Z',
        slug: 'yonex-aerus-z',
        sku: 'YNX-AZ',
        price: 3800000,
        original_price: 4200000,
        category_id: catShoes.id,
        brand_id: brandYonex.id,
        stock_quantity: 30,
        badge: ProductBadge.SALE,
        rating: 4.9,
        is_active: true,
      },
      {
        name: 'Victor A922',
        slug: 'victor-a922',
        sku: 'VCT-A922',
        price: 2800000,
        original_price: undefined,
        category_id: catShoes.id,
        brand_id: brandVictor.id,
        stock_quantity: 45,
        badge: ProductBadge.NEW,
        rating: 4.6,
        is_active: true,
      },
      {
        name: 'Lining Ranger TD',
        slug: 'lining-ranger-td',
        sku: 'LN-RTD',
        price: 2200000,
        original_price: 2600000,
        category_id: catShoes.id,
        brand_id: brandLining.id,
        stock_quantity: 60,
        badge: ProductBadge.SALE,
        rating: 4.4,
        is_active: true,
      },
      // Clothes
      {
        name: 'Yonex Men Polo Shirt 2024',
        slug: 'yonex-men-polo-shirt-2024',
        sku: 'YNX-MPS24',
        price: 850000,
        original_price: undefined,
        category_id: catClothes.id,
        brand_id: brandYonex.id,
        stock_quantity: 100,
        badge: ProductBadge.NEW,
        rating: 4.5,
        is_active: true,
      },
      {
        name: 'Victor Women Dress 2024',
        slug: 'victor-women-dress-2024',
        sku: 'VCT-WD24',
        price: 950000,
        original_price: 1100000,
        category_id: catClothes.id,
        brand_id: brandVictor.id,
        stock_quantity: 80,
        badge: ProductBadge.SALE,
        rating: 4.6,
        is_active: true,
      },
      // Accessories
      {
        name: 'Yonex Grip Tape AC102',
        slug: 'yonex-grip-tape-ac102',
        sku: 'YNX-GT-AC102',
        price: 45000,
        original_price: undefined,
        category_id: catAccessories.id,
        brand_id: brandYonex.id,
        stock_quantity: 500,
        badge: ProductBadge.BESTSELLER,
        rating: 4.7,
        is_active: true,
      },
      {
        name: 'Yonex String BG65',
        slug: 'yonex-string-bg65',
        sku: 'YNX-BG65',
        price: 120000,
        original_price: undefined,
        category_id: catAccessories.id,
        brand_id: brandYonex.id,
        stock_quantity: 300,
        badge: ProductBadge.BESTSELLER,
        rating: 4.8,
        is_active: true,
      },
      // Bags
      {
        name: 'Yonex Pro Racquet Bag 9pcs',
        slug: 'yonex-pro-racquet-bag-9pcs',
        sku: 'YNX-PRB9',
        price: 2500000,
        original_price: 2800000,
        category_id: catBags.id,
        brand_id: brandYonex.id,
        stock_quantity: 25,
        badge: ProductBadge.SALE,
        rating: 4.7,
        is_active: true,
      },
      {
        name: 'Victor Backpack BR9012',
        slug: 'victor-backpack-br9012',
        sku: 'VCT-BP9012',
        price: 1200000,
        original_price: undefined,
        category_id: catBags.id,
        brand_id: brandVictor.id,
        stock_quantity: 40,
        badge: ProductBadge.NONE,
        rating: 4.5,
        is_active: true,
      },
      // Shuttlecocks
      {
        name: 'Yonex Aerosensa 50',
        slug: 'yonex-aerosensa-50',
        sku: 'YNX-AS50',
        price: 480000,
        original_price: undefined,
        category_id: catShuttlecock.id,
        brand_id: brandYonex.id,
        stock_quantity: 200,
        badge: ProductBadge.BESTSELLER,
        rating: 4.9,
        is_active: true,
      },
      {
        name: 'Victor Gold Champion',
        slug: 'victor-gold-champion',
        sku: 'VCT-GC',
        price: 380000,
        original_price: 420000,
        category_id: catShuttlecock.id,
        brand_id: brandVictor.id,
        stock_quantity: 150,
        badge: ProductBadge.SALE,
        rating: 4.6,
        is_active: true,
      },
    ];

    const products: Product[] = [];
    for (const productData of productsData) {
      const product = await productRepo.save(productData);
      products.push(product);
    }

    console.log(`✅ Created ${products.length} products`);

    // ============================================
    // SEED USERS (Admin + Customers)
    // ============================================
    console.log('👤 Seeding users...');

    // Create users - Password for all: 'password123' (bcrypt hash)
    // Admin password: 'admin123'
    const adminHash = '$2a$10$QWWPdNlZZ6CNhOqjKg5fZuHLZqVjXdGxRH7VfKfKpqPZk.hEqgBi.'; // admin123
    const userHash = '$2a$10$QWWPdNlZZ6CNhOqjKg5fZuHLZqVjXdGxRH7VfKfKpqPZk.hEqgBi.'; // password123
    
    const users = await userRepo.save([
      { email: 'admin@badshop.com', password_hash: adminHash, name: 'Admin User', phone: '0901234567', role: UserRole.ADMIN, is_active: true },
      { email: 'nguyen.van.a@gmail.com', password_hash: userHash, name: 'Nguyễn Văn A', phone: '0912345678', role: UserRole.CUSTOMER, is_active: true },
      { email: 'tran.thi.b@gmail.com', password_hash: userHash, name: 'Trần Thị B', phone: '0923456789', role: UserRole.CUSTOMER, is_active: true },
      { email: 'le.van.c@gmail.com', password_hash: userHash, name: 'Lê Văn C', phone: '0934567890', role: UserRole.CUSTOMER, is_active: true },
      { email: 'pham.thi.d@gmail.com', password_hash: userHash, name: 'Phạm Thị D', phone: '0945678901', role: UserRole.CUSTOMER, is_active: true },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // ============================================
    // SEED ADDRESSES
    // ============================================
    console.log('🏠 Seeding addresses...');
    const addresses = await addressRepo.save([
      { user_id: users[1].id, name: 'Nhà riêng', phone: '0912345678', street: '123 Nguyễn Huệ, Quận 1', city: 'TP. Hồ Chí Minh', is_default: true },
      { user_id: users[1].id, name: 'Văn phòng', phone: '0912345678', street: '456 Lê Lợi, Quận 3', city: 'TP. Hồ Chí Minh', is_default: false },
      { user_id: users[2].id, name: 'Nhà', phone: '0923456789', street: '789 Trần Hưng Đạo, Hoàn Kiếm', city: 'Hà Nội', is_default: true },
      { user_id: users[3].id, name: 'Nhà', phone: '0934567890', street: '321 Bạch Đằng, Hải Châu', city: 'Đà Nẵng', is_default: true },
      { user_id: users[4].id, name: 'Nhà', phone: '0945678901', street: '654 Nguyễn Văn Linh, Ninh Kiều', city: 'Cần Thơ', is_default: true },
    ]);
    console.log(`✅ Created ${addresses.length} addresses`);

    // ============================================
    // SEED PRODUCT IMAGES
    // ============================================
    console.log('🖼️ Seeding product images...');
    const imageData = [];
    for (let i = 0; i < Math.min(products.length, 10); i++) {
      imageData.push({ product_id: products[i].id, image_url: `/products/${products[i].slug}-1.jpg`, is_primary: true });
      imageData.push({ product_id: products[i].id, image_url: `/products/${products[i].slug}-2.jpg`, is_primary: false });
    }
    const productImages = await productImageRepo.save(imageData);
    console.log(`✅ Created ${productImages.length} product images`);

    // ============================================
    // SEED REVIEWS
    // ============================================
    console.log('⭐ Seeding reviews...');
    const reviewsData = [
      { user_id: users[1].id, product_id: products[0].id, rating: 5, comment: 'Vợt tuyệt vời! Cầm rất chắc tay và đập cầu rất mạnh.' },
      { user_id: users[2].id, product_id: products[0].id, rating: 5, comment: 'Sản phẩm chính hãng, giao hàng nhanh.' },
      { user_id: users[3].id, product_id: products[1].id, rating: 4, comment: 'Vợt nhẹ, đánh tấn công tốt. Rất hài lòng!' },
      { user_id: users[1].id, product_id: products[9].id, rating: 5, comment: 'Giày êm chân, chống trượt tốt.' },
      { user_id: users[4].id, product_id: products[9].id, rating: 4, comment: 'Đẹp và thoải mái khi mang.' },
      { user_id: users[2].id, product_id: products[13].id, rating: 5, comment: 'Áo đẹp, chất liệu mát, thấm hút mồ hôi tốt.' },
      { user_id: users[3].id, product_id: products[15].id, rating: 5, comment: 'Cuốn cán chất lượng cao, bám tay tốt.' },
      { user_id: users[4].id, product_id: products[19].id, rating: 5, comment: 'Cầu lông bay ổn định, bền.' },
    ];
    const reviews = await reviewRepo.save(reviewsData);
    console.log(`✅ Created ${reviews.length} reviews`);

    // ============================================
    // SEED CAMPAIGNS
    // ============================================
    console.log('🎯 Seeding campaigns...');
    const now = new Date();
    const campaigns = await campaignRepo.save([
      { name: 'Giảm giá mùa hè', code: 'SUMMER2024', discount_type: DiscountType.PERCENTAGE, discount_value: 10, start_date: now, end_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      { name: 'Khách hàng mới', code: 'NEWUSER', discount_type: DiscountType.FIXED_AMOUNT, discount_value: 100000, start_date: now, end_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) },
      { name: 'Tết Nguyên Đán', code: 'TET2024', discount_type: DiscountType.PERCENTAGE, discount_value: 15, start_date: now, end_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) },
    ]);
    console.log(`✅ Created ${campaigns.length} campaigns`);

    // ============================================
    // SEED FLASH SALES
    // ============================================
    console.log('⚡ Seeding flash sales...');
    const flashSales = await flashSaleRepo.save([
      { name: 'Flash Sale Cuối Tuần', start_time: now, end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), is_active: true },
      { name: 'Siêu Sale 12.12', start_time: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), end_time: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), is_active: true },
    ]);

    // Add products to flash sales
    const flashSaleProducts = await flashSaleProductRepo.save([
      { flash_sale_id: flashSales[0].id, product_id: products[0].id, flash_price: 3900000, flash_stock: 10, sold_count: 3 },
      { flash_sale_id: flashSales[0].id, product_id: products[4].id, flash_price: 2700000, flash_stock: 15, sold_count: 5 },
      { flash_sale_id: flashSales[0].id, product_id: products[9].id, flash_price: 2800000, flash_stock: 20, sold_count: 8 },
      { flash_sale_id: flashSales[1].id, product_id: products[1].id, flash_price: 3600000, flash_stock: 8, sold_count: 0 },
      { flash_sale_id: flashSales[1].id, product_id: products[10].id, flash_price: 3200000, flash_stock: 12, sold_count: 0 },
    ]);
    console.log(`✅ Created ${flashSales.length} flash sales with ${flashSaleProducts.length} products`);

    // ============================================
    // SEED ORDERS
    // ============================================
    console.log('📦 Seeding orders...');
    const orders = await orderRepo.save([
      { order_number: 'ORD-2024-0001', user_id: users[1].id, total: 4500000, status: OrderStatus.DELIVERED, payment_status: PaymentStatus.PAID },
      { order_number: 'ORD-2024-0002', user_id: users[2].id, total: 7000000, status: OrderStatus.SHIPPING, payment_status: PaymentStatus.PAID },
      { order_number: 'ORD-2024-0003', user_id: users[1].id, total: 3200000, status: OrderStatus.CONFIRMED, payment_status: PaymentStatus.PAID },
      { order_number: 'ORD-2024-0004', user_id: users[3].id, total: 2800000, status: OrderStatus.PENDING_PAYMENT, payment_status: PaymentStatus.PENDING },
      { order_number: 'ORD-2024-0005', user_id: users[4].id, total: 950000, status: OrderStatus.DELIVERED, payment_status: PaymentStatus.PAID },
    ]);

    // Add order items
    const orderItems = await orderItemRepo.save([
      { order_id: orders[0].id, product_id: products[0].id, price: 4500000, quantity: 1 },
      { order_id: orders[1].id, product_id: products[1].id, price: 4200000, quantity: 1 },
      { order_id: orders[1].id, product_id: products[9].id, price: 2800000, quantity: 1 },
      { order_id: orders[2].id, product_id: products[9].id, price: 3200000, quantity: 1 },
      { order_id: orders[3].id, product_id: products[6].id, price: 2800000, quantity: 1 },
      { order_id: orders[4].id, product_id: products[14].id, price: 950000, quantity: 1 },
    ]);
    console.log(`✅ Created ${orders.length} orders with ${orderItems.length} items`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Brands: ${brands.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Addresses: ${addresses.length}`);
    console.log(`   - Product Images: ${productImages.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Campaigns: ${campaigns.length}`);
    console.log(`   - Flash Sales: ${flashSales.length}`);
    console.log(`   - Orders: ${orders.length}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

seed();

