import express from 'express';
import { normalizeEmail } from '../middlewares/normalize-email';
import { otpEligibilityGuard, otpRequestRecord } from '../middlewares/otp-service/guards';
import { validateSignupData } from '../middlewares/validateSignupData';
import { verifyOtp } from '../helpers/auth.helper';
import {
  createSeller,
  createShop,
  sendSellerSignUpOtp,
} from '../controllers/seller.controller';


const router = express.Router();

router.post(
  '/send-seller-otp',
  validateSignupData('seller'),
  normalizeEmail,
  otpEligibilityGuard,
  otpRequestRecord,
  sendSellerSignUpOtp
);

router.post(
  '/verify-create-seller',
  normalizeEmail,
  validateSignupData('seller'),
  verifyOtp,
  createSeller
);

router.post('/createshop', createShop);


export default router;