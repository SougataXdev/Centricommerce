import express from 'express';
import {
	createDiscountCode,
	deleteDiscountCode,
	getCategories,
	getDiscountCodes,
} from '../controllers/product.controller';
import { isSellerAuthenticated } from '../../../auth-service/src/middlewares/isAuthenticated';


const router = express.Router();


router.get('/get-categories', getCategories);
router.post('/create-discountcode', isSellerAuthenticated, createDiscountCode);
router.post('/delete-discountcode/:id', isSellerAuthenticated, deleteDiscountCode);

// New REST-friendly aliases
router.post('/discountcodes', isSellerAuthenticated, createDiscountCode);
router.get('/discountcodes', isSellerAuthenticated, getDiscountCodes);
router.delete('/discountcodes/:id', isSellerAuthenticated, deleteDiscountCode);
router.get('/get-discountcodes', isSellerAuthenticated, getDiscountCodes);

export default router;