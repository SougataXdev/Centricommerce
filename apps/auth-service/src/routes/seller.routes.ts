import express from 'express';
import { normalizeEmail } from '../middlewares/normalize-email';
import { otpEligibilityGuard, otpRequestRecord } from '../middlewares/otp-service/guards';
import { validateSignupData } from '../middlewares/validateSignupData';
import { verifyOtp } from '../helpers/auth.helper';
import {
  createSeller,
  createShop,
  createStripeConnectLink,
  loginSeller,
  getSellerInfo,
  sendSellerSignUpOtp,
} from '../controllers/seller.controller';
import { renewAccessToken } from '../controllers/auth-token.controller';
import { isSellerAuthenticated } from '../middlewares/isAuthenticated';


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
router.post('/stripe/connect-link', createStripeConnectLink);
router.post('/login', normalizeEmail, loginSeller);
router.post('/renew-access-token', renewAccessToken);
router.get('/me', isSellerAuthenticated, getSellerInfo);

export default router;