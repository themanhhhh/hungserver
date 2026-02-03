import { Request, Response } from 'express';
import { PinataService } from '../services/pinata.service';
import { ProductImageService } from '../services/product-image.service';
import { AppError } from '../middlewares/error.middleware';

export class UploadController {
  private pinataService: PinataService;
  private productImageService: ProductImageService;

  constructor() {
    this.pinataService = new PinataService();
    this.productImageService = new ProductImageService();
  }

  /**
   * Upload image to Pinata
   * POST /api/v1/upload/image
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const imageUrl = await this.pinataService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
      },
    });
  }

  /**
   * Upload and attach image to product
   * POST /api/v1/upload/product/:productId/image
   */
  async uploadProductImage(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;
    const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Upload to Pinata
    const imageUrl = await this.pinataService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // If setting as primary, unset other primary images
    if (isPrimary) {
      const existingImages = await this.productImageService.findByProduct(productId);
      for (const img of existingImages) {
        if (img.is_primary) {
          await this.productImageService.update(img.id, { is_primary: false });
        }
      }
    }

    // Save to database
    const productImage = await this.productImageService.create({
      product_id: productId,
      image_url: imageUrl,
      is_primary: isPrimary,
    });

    res.status(201).json({
      success: true,
      message: 'Product image uploaded successfully',
      data: productImage,
    });
  }

  /**
   * Delete product image
   * DELETE /api/v1/upload/product-image/:imageId
   */
  async deleteProductImage(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;

    const productImage = await this.productImageService.findById(imageId);
    if (!productImage) {
      throw new AppError('Product image not found', 404);
    }

    // Try to unpin from Pinata
    const cid = this.pinataService.extractCid(productImage.image_url);
    if (cid) {
      try {
        await this.pinataService.unpinFile(cid);
      } catch (error) {
        console.warn('Failed to unpin from Pinata:', error);
        // Continue anyway - we'll remove from DB
      }
    }

    // Soft delete from database
    await this.productImageService.update(imageId, { is_delete: true });

    res.json({
      success: true,
      message: 'Product image deleted successfully',
    });
  }

  /**
   * Get all images for a product
   * GET /api/v1/upload/product/:productId/images
   */
  async getProductImages(req: Request, res: Response): Promise<void> {
    const { productId } = req.params;

    const images = await this.productImageService.findByProduct(productId);

    res.json({
      success: true,
      data: images.filter(img => !img.is_delete),
    });
  }
}
