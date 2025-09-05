import express from 'express';
import { verifyOtp } from '../helpers/auth.helper';
import { validateSignupData } from '../middlewares/validateSignupData';
import { createUser, loginUser, sendSignupOtp, forgotPasswordRequest, forgetPassword } from '../controllers/user.controller';
import {
  otpEligibilityGuard,
  otpRequestRecord,
} from '../middlewares/otp-service/guards';
import { normalizeEmail } from '../middlewares/normalize-email';

const router = express.Router();

router.post(
  '/signup',
  validateSignupData('user'),
  normalizeEmail,
  otpEligibilityGuard,
  otpRequestRecord,
  sendSignupOtp
);


router.post('/signup/verify', normalizeEmail, verifyOtp, createUser);

router.post("/login" , loginUser);

router.post(
  '/forgot-password/request',
  normalizeEmail,
  otpEligibilityGuard,
  otpRequestRecord,
  forgotPasswordRequest
);

router.post(
  '/forgot-password/reset',
  normalizeEmail,
  verifyOtp, 
  forgetPassword 
);

export default router;
