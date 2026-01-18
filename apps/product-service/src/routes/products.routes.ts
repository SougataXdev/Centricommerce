import express from 'express';
import {
  createDiscountCode,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
  getSellerProducts,
  uploadImageToImageKit,
  deleteImageFromImageKit,
  createProduct,
  deleteProduct,
  restoreProduct,
} from '../controllers/product.controller';
import { isSellerAuthenticated } from '../../../auth-service/src/middlewares/isAuthenticated';

const router = express.Router();

router.get('/get-categories', getCategories);
router.post('/discountcodes', isSellerAuthenticated, createDiscountCode);
router.get('/discountcodes', isSellerAuthenticated, getDiscountCodes);
router.delete('/discountcodes/:id', isSellerAuthenticated, deleteDiscountCode);
router.post('/upload-image', isSellerAuthenticated, uploadImageToImageKit);
router.delete(
  '/delete-image/:id',
  isSellerAuthenticated,
  deleteImageFromImageKit
);

router.post('/create-product', isSellerAuthenticated, createProduct);
router.get('/products', isSellerAuthenticated, getSellerProducts);
router.delete('/products/:id', isSellerAuthenticated, deleteProduct);
router.patch('/products/:id/restore', isSellerAuthenticated, restoreProduct);

export default router;
