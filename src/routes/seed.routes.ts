import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Category } from '../entities/Category';
import { Brand } from '../entities/Brand';
import { Product } from '../entities/Product';
import { ProductBadge } from '../enums';

const router = Router();

// POST /api/v1/seed - Seed sample data
router.post('/', async (req, res) => {
  try {
    const categoryRepo = AppDataSource.getRepository(Category);
    const brandRepo = AppDataSource.getRepository(Brand);
    const productRepo = AppDataSource.getRepository(Product);

    // Check if data already exists
    const existingProducts = await productRepo.count();
    if (existingProducts > 5) {
      return res.json({
        success: false,
        message: 'Database already has data. Skipping seed.',
        counts: {
          products: existingProducts,
        }
      });
    }

    // Clear existing data
    await productRepo.delete({});
    await categoryRepo.delete({});
    await brandRepo.delete({});

    // SEED CATEGORIES
    const categories = await categoryRepo.save([
      { name: 'Vợt cầu lông', slug: 'vot-cau-long', is_active: true },
      { name: 'Giày cầu lông', slug: 'giay-cau-long', is_active: true },
      { name: 'Quần áo cầu lông', slug: 'quan-ao-cau-long', is_active: true },
      { name: 'Phụ kiện', slug: 'phu-kien', is_active: true },
      { name: 'Túi đựng vợt', slug: 'tui-dung-vot', is_active: true },
      { name: 'Cầu lông', slug: 'cau-long', is_active: true },
    ]);

    const [catRacket, catShoes, catClothes, catAccessories, catBags, catShuttlecock] = categories;

    // SEED BRANDS
    const brands = await brandRepo.save([
      { name: 'Yonex', slug: 'yonex', country: 'Japan', logo_url: '/brands/yonex.png' },
      { name: 'Victor', slug: 'victor', country: 'Taiwan', logo_url: '/brands/victor.png' },
      { name: 'Lining', slug: 'lining', country: 'China', logo_url: '/brands/lining.png' },
      { name: 'Mizuno', slug: 'mizuno', country: 'Japan', logo_url: '/brands/mizuno.png' },
      { name: 'Kawasaki', slug: 'kawasaki', country: 'Japan', logo_url: '/brands/kawasaki.png' },
      { name: 'Apacs', slug: 'apacs', country: 'Malaysia', logo_url: '/brands/apacs.png' },
    ]);

    const [brandYonex, brandVictor, brandLining] = brands;

    // SEED PRODUCTS
    const productsData = [
      // Yonex Rackets
      { name: 'Yonex Astrox 100 ZZ', slug: 'yonex-astrox-100-zz', sku: 'YNX-AX100ZZ', price: 4500000, original_price: 5200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 25, badge: ProductBadge.BESTSELLER, rating: 4.9, is_active: true },
      { name: 'Yonex Nanoflare 800 Pro', slug: 'yonex-nanoflare-800-pro', sku: 'YNX-NF800P', price: 4200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 30, badge: ProductBadge.NEW, rating: 4.8, is_active: true },
      { name: 'Yonex Arcsaber 11 Pro', slug: 'yonex-arcsaber-11-pro', sku: 'YNX-AS11P', price: 3800000, original_price: 4200000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 20, badge: ProductBadge.SALE, rating: 4.7, is_active: true },
      { name: 'Yonex Duora 10', slug: 'yonex-duora-10', sku: 'YNX-D10', price: 3500000, category_id: catRacket.id, brand_id: brandYonex.id, stock_quantity: 15, badge: ProductBadge.NONE, rating: 4.6, is_active: true },
      // Victor Rackets
      { name: 'Victor Thruster K Falcon', slug: 'victor-thruster-k-falcon', sku: 'VCT-TKF', price: 3200000, original_price: 3800000, category_id: catRacket.id, brand_id: brandVictor.id, stock_quantity: 18, badge: ProductBadge.SALE, rating: 4.5, is_active: true },
      { name: 'Victor Auraspeed 90K', slug: 'victor-auraspeed-90k', sku: 'VCT-AS90K', price: 4000000, category_id: catRacket.id, brand_id: brandVictor.id, stock_quantity: 22, badge: ProductBadge.NEW, rating: 4.7, is_active: true },
      { name: 'Victor DriveX 9X', slug: 'victor-drivex-9x', sku: 'VCT-DX9X', price: 2800000, category_id: catRacket.id, brand_id: brandVictor.id, stock_quantity: 35, badge: ProductBadge.BESTSELLER, rating: 4.6, is_active: true },
      // Lining Rackets
      { name: 'Lining Aeronaut 9000', slug: 'lining-aeronaut-9000', sku: 'LN-AN9000', price: 3600000, original_price: 4000000, category_id: catRacket.id, brand_id: brandLining.id, stock_quantity: 20, badge: ProductBadge.SALE, rating: 4.5, is_active: true },
      { name: 'Lining N7 II Light', slug: 'lining-n7-ii-light', sku: 'LN-N7IIL', price: 2500000, category_id: catRacket.id, brand_id: brandLining.id, stock_quantity: 40, badge: ProductBadge.NONE, rating: 4.3, is_active: true },
      // Shoes
      { name: 'Yonex Power Cushion 65 Z3', slug: 'yonex-power-cushion-65-z3', sku: 'YNX-PC65Z3', price: 3200000, category_id: catShoes.id, brand_id: brandYonex.id, stock_quantity: 50, badge: ProductBadge.BESTSELLER, rating: 4.8, is_active: true },
      { name: 'Yonex Aerus Z', slug: 'yonex-aerus-z', sku: 'YNX-AZ', price: 3800000, original_price: 4200000, category_id: catShoes.id, brand_id: brandYonex.id, stock_quantity: 30, badge: ProductBadge.SALE, rating: 4.9, is_active: true },
      { name: 'Victor A922', slug: 'victor-a922', sku: 'VCT-A922', price: 2800000, category_id: catShoes.id, brand_id: brandVictor.id, stock_quantity: 45, badge: ProductBadge.NEW, rating: 4.6, is_active: true },
      { name: 'Lining Ranger TD', slug: 'lining-ranger-td', sku: 'LN-RTD', price: 2200000, original_price: 2600000, category_id: catShoes.id, brand_id: brandLining.id, stock_quantity: 60, badge: ProductBadge.SALE, rating: 4.4, is_active: true },
      // Clothes
      { name: 'Yonex Men Polo Shirt 2024', slug: 'yonex-men-polo-shirt-2024', sku: 'YNX-MPS24', price: 850000, category_id: catClothes.id, brand_id: brandYonex.id, stock_quantity: 100, badge: ProductBadge.NEW, rating: 4.5, is_active: true },
      { name: 'Victor Women Dress 2024', slug: 'victor-women-dress-2024', sku: 'VCT-WD24', price: 950000, original_price: 1100000, category_id: catClothes.id, brand_id: brandVictor.id, stock_quantity: 80, badge: ProductBadge.SALE, rating: 4.6, is_active: true },
      // Accessories
      { name: 'Yonex Grip Tape AC102', slug: 'yonex-grip-tape-ac102', sku: 'YNX-GT-AC102', price: 45000, category_id: catAccessories.id, brand_id: brandYonex.id, stock_quantity: 500, badge: ProductBadge.BESTSELLER, rating: 4.7, is_active: true },
      { name: 'Yonex String BG65', slug: 'yonex-string-bg65', sku: 'YNX-BG65', price: 120000, category_id: catAccessories.id, brand_id: brandYonex.id, stock_quantity: 300, badge: ProductBadge.BESTSELLER, rating: 4.8, is_active: true },
      // Bags
      { name: 'Yonex Pro Racquet Bag 9pcs', slug: 'yonex-pro-racquet-bag-9pcs', sku: 'YNX-PRB9', price: 2500000, original_price: 2800000, category_id: catBags.id, brand_id: brandYonex.id, stock_quantity: 25, badge: ProductBadge.SALE, rating: 4.7, is_active: true },
      { name: 'Victor Backpack BR9012', slug: 'victor-backpack-br9012', sku: 'VCT-BP9012', price: 1200000, category_id: catBags.id, brand_id: brandVictor.id, stock_quantity: 40, badge: ProductBadge.NONE, rating: 4.5, is_active: true },
      // Shuttlecocks
      { name: 'Yonex Aerosensa 50', slug: 'yonex-aerosensa-50', sku: 'YNX-AS50', price: 480000, category_id: catShuttlecock.id, brand_id: brandYonex.id, stock_quantity: 200, badge: ProductBadge.BESTSELLER, rating: 4.9, is_active: true },
      { name: 'Victor Gold Champion', slug: 'victor-gold-champion', sku: 'VCT-GC', price: 380000, original_price: 420000, category_id: catShuttlecock.id, brand_id: brandVictor.id, stock_quantity: 150, badge: ProductBadge.SALE, rating: 4.6, is_active: true },
    ];

    const products = [];
    for (const data of productsData) {
      const product = await productRepo.save(data);
      products.push(product);
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        categories: categories.length,
        brands: brands.length,
        products: products.length,
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
