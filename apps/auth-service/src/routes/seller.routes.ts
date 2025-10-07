import express from 'express';
import { normalizeEmail } from '../middlewares/normalize-email';
import { otpEligibilityGuard, otpRequestRecord } from '../middlewares/otp-service/guards';
import { sendSignupOtp } from '../controllers/user.controller';
import { validateSignupData } from '../middlewares/validateSignupData';
import { verifyOtp } from '../helpers/auth.helper';
import { createSeller } from '../controllers/seller.controller';


const router = express.Router();

router.post(
  '/send-seller-otp',
  validateSignupData("seller"),
  normalizeEmail,
  otpEligibilityGuard,
  otpRequestRecord,
  sendSignupOtp
);

router.post("/signup" ,normalizeEmail, validateSignupData("seller") , verifyOtp , createSeller);