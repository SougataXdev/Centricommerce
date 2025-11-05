import express from 'express';
import {
  createDiscountCode,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
  uploadImageToImageKit,
  deleteImageFromImageKit,
  createProduct,
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

export default router;
